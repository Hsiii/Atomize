import { useLayoutEffect, useRef } from 'react';
import type { ChangeEvent, JSX, KeyboardEvent } from 'react';
import { Search } from 'lucide-react';

import { uiText } from '../../app-state';
import { BackButton } from '../ui/BackButton';
import {
    clampFloatingParticleOutsideCollider,
    clampFloatingValue,
    getFloatingTitleOrbCollider,
    resolveFloatingBlobCollisions,
    resolveFloatingTitleOrbCollision,
    writeFloatingParticleStyles,
} from './floating-blob-physics';
import type { FloatingBlobParticle } from './floating-blob-physics';

type JoinBlobId = 'code' | 'go';

type MultiplayerJoinScreenProps = {
    activeToastMessage: string | undefined;
    createOrJoinButtonText: string;
    isJoinPending: boolean;
    roomIdInput: string;
    onBack: () => void;
    onRoomIdInputChange: (value: string) => void;
    onSubmit: () => void;
};

const JOIN_COLLISION_GAP = 4;
const JOIN_TITLE_ORB_CLEARANCE = 6;
const JOIN_WALL_PADDING = 0;
const JOIN_MIN_SPEED = 0.15;
const JOIN_MAX_SPEED = 0.36;

function seedJoinParticles(
    field: Readonly<HTMLDivElement>,
    titleOrb: Readonly<HTMLDivElement>,
    elements: ReadonlyMap<JoinBlobId, HTMLElement>,
    previousParticles: ReadonlyArray<FloatingBlobParticle<JoinBlobId>>
): ReadonlyArray<FloatingBlobParticle<JoinBlobId>> {
    const fieldRect = field.getBoundingClientRect();
    const collider = getFloatingTitleOrbCollider(field, titleOrb);
    const previousParticleMap = new Map(
        previousParticles.map((particle) => [particle.id, particle])
    );
    const seeds: ReadonlyArray<{
        id: JoinBlobId;
        x: number;
        y: number;
        vx: number;
        vy: number;
    }> = [
        { id: 'code', x: 0.32, y: 0.62, vx: 0.24, vy: -0.19 },
        { id: 'go', x: 0.72, y: 0.74, vx: -0.21, vy: 0.18 },
    ];

    return seeds.flatMap((seed) => {
        const element = elements.get(seed.id);

        if (!element) {
            return [];
        }

        const radius = Math.max(element.offsetWidth, element.offsetHeight) / 2;
        const maxX = Math.max(
            JOIN_WALL_PADDING,
            fieldRect.width - radius * 2 - JOIN_WALL_PADDING
        );
        const maxY = Math.max(
            JOIN_WALL_PADDING,
            fieldRect.height - radius * 2 - JOIN_WALL_PADDING
        );
        const previousParticle = previousParticleMap.get(seed.id);
        const unclampedX = previousParticle
            ? previousParticle.x
            : fieldRect.width * seed.x - radius;
        const unclampedY = previousParticle
            ? previousParticle.y
            : fieldRect.height * seed.y - radius;
        const clampedX = clampFloatingValue(
            unclampedX,
            JOIN_WALL_PADDING,
            maxX
        );
        const clampedY = clampFloatingValue(
            unclampedY,
            JOIN_WALL_PADDING,
            maxY
        );
        const constrainedPosition = clampFloatingParticleOutsideCollider(
            clampedX,
            clampedY,
            radius,
            collider,
            JOIN_TITLE_ORB_CLEARANCE
        );

        return [
            {
                id: seed.id,
                radius,
                x: constrainedPosition.x,
                y: constrainedPosition.y,
                vx: previousParticle?.vx ?? seed.vx,
                vy: previousParticle?.vy ?? seed.vy,
            },
        ];
    });
}

function getJoinBlobTarget(
    blobId: JoinBlobId,
    fieldRect: Readonly<DOMRect>,
    time: number
): { x: number; y: number } {
    if (blobId === 'code') {
        return {
            x:
                fieldRect.width * 0.36 +
                Math.sin(time / 1500) * fieldRect.width * 0.04,
            y:
                fieldRect.height * 0.6 +
                Math.cos(time / 1700) * fieldRect.height * 0.025,
        };
    }

    return {
        x:
            fieldRect.width * 0.72 +
            Math.cos(time / 1400) * fieldRect.width * 0.035,
        y:
            fieldRect.height * 0.77 +
            Math.sin(time / 1600) * fieldRect.height * 0.03,
    };
}

export function MultiplayerJoinScreen({
    activeToastMessage,
    createOrJoinButtonText,
    isJoinPending,
    roomIdInput,
    onBack,
    onRoomIdInputChange,
    onSubmit,
}: MultiplayerJoinScreenProps): JSX.Element {
    const fieldRef = useRef<HTMLDivElement | null>(null);
    const titleOrbRef = useRef<HTMLDivElement | null>(null);
    const blobRefs = useRef(new Map<JoinBlobId, HTMLElement>());
    const particlesRef = useRef<Array<FloatingBlobParticle<JoinBlobId>>>([]);
    const frameRef = useRef<number | undefined>(undefined);
    const lastTimeRef = useRef(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const roomCodeDigits = Array.from(
        { length: 4 },
        (_, index) => roomIdInput[index] ?? ''
    );

    function focusInput() {
        inputRef.current?.focus();
    }

    function handleRoomCodeKeyDown(event: KeyboardEvent<HTMLElement>) {
        if (event.key === 'Enter') {
            event.preventDefault();
            onSubmit();
        }
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        onRoomIdInputChange(event.target.value);
    }

    useLayoutEffect(() => {
        const field = fieldRef.current;
        const titleOrb = titleOrbRef.current;

        if (!field || !titleOrb) {
            return undefined;
        }

        const initializeParticles = (): void => {
            particlesRef.current = [
                ...seedJoinParticles(
                    field,
                    titleOrb,
                    blobRefs.current,
                    particlesRef.current
                ),
            ];
            writeFloatingParticleStyles(
                particlesRef.current,
                blobRefs.current,
                '--join-blob-x',
                '--join-blob-y'
            );
        };

        const tick = (time: number): void => {
            const currentField = fieldRef.current;
            const currentTitleOrb = titleOrbRef.current;

            if (!currentField || !currentTitleOrb) {
                return;
            }

            const delta = lastTimeRef.current
                ? Math.min((time - lastTimeRef.current) / 16.667, 1.8)
                : 1;

            lastTimeRef.current = time;

            const fieldRect = currentField.getBoundingClientRect();
            const particles = particlesRef.current;
            const titleOrbCollider = getFloatingTitleOrbCollider(
                currentField,
                currentTitleOrb
            );

            for (const particle of particles) {
                const target = getJoinBlobTarget(particle.id, fieldRect, time);
                const particleCenterX = particle.x + particle.radius;
                const particleCenterY = particle.y + particle.radius;
                const pullX = (target.x - particleCenterX) / fieldRect.width;
                const pullY = (target.y - particleCenterY) / fieldRect.height;

                particle.vx += pullX * 0.012 * delta;
                particle.vy += pullY * 0.012 * delta;

                const speed =
                    Math.hypot(particle.vx, particle.vy) || JOIN_MIN_SPEED;
                const clampedSpeed = clampFloatingValue(
                    speed,
                    JOIN_MIN_SPEED,
                    JOIN_MAX_SPEED
                );

                particle.vx = (particle.vx / speed) * clampedSpeed;
                particle.vy = (particle.vy / speed) * clampedSpeed;
                particle.x += particle.vx * delta;
                particle.y += particle.vy * delta;

                const maxX = Math.max(
                    JOIN_WALL_PADDING,
                    fieldRect.width - particle.radius * 2 - JOIN_WALL_PADDING
                );
                const maxY = Math.max(
                    JOIN_WALL_PADDING,
                    fieldRect.height - particle.radius * 2 - JOIN_WALL_PADDING
                );

                if (particle.x <= JOIN_WALL_PADDING || particle.x >= maxX) {
                    particle.x = clampFloatingValue(
                        particle.x,
                        JOIN_WALL_PADDING,
                        maxX
                    );
                    particle.vx *= -1;
                }

                if (particle.y <= JOIN_WALL_PADDING || particle.y >= maxY) {
                    particle.y = clampFloatingValue(
                        particle.y,
                        JOIN_WALL_PADDING,
                        maxY
                    );
                    particle.vy *= -1;
                }
            }

            resolveFloatingTitleOrbCollision(
                particles,
                titleOrbCollider,
                JOIN_TITLE_ORB_CLEARANCE
            );
            resolveFloatingBlobCollisions(particles, JOIN_COLLISION_GAP);
            writeFloatingParticleStyles(
                particles,
                blobRefs.current,
                '--join-blob-x',
                '--join-blob-y'
            );
            frameRef.current = globalThis.requestAnimationFrame(tick);
        };

        initializeParticles();
        lastTimeRef.current = 0;
        frameRef.current = globalThis.requestAnimationFrame(tick);

        const resizeObserver = new ResizeObserver(() => {
            initializeParticles();
            lastTimeRef.current = 0;
        });

        resizeObserver.observe(field);

        return () => {
            resizeObserver.disconnect();

            if (frameRef.current !== undefined) {
                globalThis.cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    return (
        <main className='app-shell fullscreen-shell'>
            <BackButton onBack={onBack} />
            <section className='screen lobby-screen join-screen'>
                <div className='join-layout'>
                    {activeToastMessage ? (
                        <div aria-live='polite' className='join-toast-layer'>
                            <div className='waiting-toast'>
                                {activeToastMessage}
                            </div>
                        </div>
                    ) : undefined}

                    <div
                        aria-hidden='true'
                        className='join-title-orb'
                        ref={titleOrbRef}
                    >
                        <p className='join-title'>
                            <span>{uiText.joinRoom.split(' ')[0]}</span>
                            <span>{uiText.joinRoom.split(' ')[1]}</span>
                        </p>
                    </div>

                    <div className='join-stage' ref={fieldRef}>
                        <div
                            className='join-orb'
                            onClick={focusInput}
                            onKeyDown={handleRoomCodeKeyDown}
                            ref={(element) => {
                                if (element) {
                                    blobRefs.current.set('code', element);
                                    return;
                                }

                                blobRefs.current.delete('code');
                            }}
                        >
                            <div aria-hidden='true' className='join-orb-bars'>
                                {roomCodeDigits.map((character, index) => (
                                    <span
                                        className={
                                            character
                                                ? 'join-bar filled'
                                                : 'join-bar'
                                        }
                                        key={`bar-${String(index)}`}
                                    >
                                        {character}
                                    </span>
                                ))}
                            </div>
                            <input
                                aria-label={uiText.enterCode}
                                className='join-orb-input'
                                inputMode='numeric'
                                maxLength={4}
                                onChange={handleInputChange}
                                pattern='[0-9]*'
                                ref={inputRef}
                                value={roomIdInput}
                            />
                        </div>

                        <button
                            className={`join-go-blob${
                                isJoinPending ? ' join-go-blob-pending' : ''
                            }`}
                            onClick={onSubmit}
                            ref={(element) => {
                                if (element) {
                                    blobRefs.current.set('go', element);
                                    return;
                                }

                                blobRefs.current.delete('go');
                            }}
                            type='button'
                        >
                            <Search
                                aria-hidden='true'
                                className='join-go-icon'
                            />
                            <span className='join-go-text'>
                                {createOrJoinButtonText}
                            </span>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
