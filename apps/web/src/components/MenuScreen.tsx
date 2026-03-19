import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Play, Plus, Search, Sword, Swords } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { uiText } from '../app-state';

import './MenuScreen.css';

type MenuScreenProps = {
    onStartSingleGame: () => void;
    onStartCreateRoomFlow: () => void;
    onStartJoinRoomFlow: () => void;
};

type MenuPhase = 'play' | 'mode-select' | 'multiplayer-select';
type BlobId = 'play' | 'solo' | 'dual' | 'create-room' | 'join-room';

type BlobDefinition = {
    id: BlobId;
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    tone: 'play' | 'solo' | 'dual' | 'create' | 'join';
};

type BlobParticle = {
    id: BlobId;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
};

type CircleCollider = {
    centerX: number;
    centerY: number;
    radius: number;
};

type ActiveDrag = {
    blobId: BlobId;
    pointerId: number;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    startClientX: number;
    startClientY: number;
    lastClientX: number;
    lastClientY: number;
    lastTimestamp: number;
    moved: boolean;
};

const COLLISION_GAP = 2;
const WALL_PADDING = 6;
const MIN_SPEED = 0.16;
const MAX_SPEED = 0.48;
const DRAG_THRESHOLD_PX = 10;

const phaseSeeds: Record<
    MenuPhase,
    ReadonlyArray<{ x: number; y: number; vx: number; vy: number }>
> = {
    'play': [{ x: 0.5, y: 0.5, vx: 0.24, vy: -0.2 }],
    'mode-select': [
        { x: 0.34, y: 0.54, vx: 0.22, vy: -0.18 },
        { x: 0.69, y: 0.44, vx: -0.24, vy: 0.21 },
    ],
    'multiplayer-select': [
        { x: 0.27, y: 0.42, vx: 0.2, vy: 0.18 },
        { x: 0.67, y: 0.35, vx: -0.25, vy: 0.16 },
        { x: 0.58, y: 0.7, vx: -0.19, vy: -0.23 },
    ],
};

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function seedParticles(
    blobs: readonly BlobDefinition[],
    phase: MenuPhase,
    field: Readonly<HTMLDivElement>,
    titleAtom: Readonly<HTMLSpanElement> | null,
    buttons: ReadonlyMap<BlobId, HTMLButtonElement>,
    previousParticles: readonly BlobParticle[],
    splitSourceId: BlobId | undefined
): readonly BlobParticle[] {
    const fieldRect = field.getBoundingClientRect();
    const seeds = phaseSeeds[phase];
    const previousParticleMap = new Map(
        previousParticles.map((particle) => [particle.id, particle])
    );
    const sourceParticle = splitSourceId
        ? previousParticleMap.get(splitSourceId)
        : undefined;
    const sourceCenterX = sourceParticle
        ? sourceParticle.x + sourceParticle.radius
        : fieldRect.width / 2;
    const sourceCenterY = sourceParticle
        ? sourceParticle.y + sourceParticle.radius
        : fieldRect.height / 2;

    return blobs.map((blob, index) => {
        const button = buttons.get(blob.id);
        const buttonRect = button?.getBoundingClientRect();
        const radius =
            Math.max(buttonRect?.width ?? 0, buttonRect?.height ?? 0) / 2;
        const seed = seeds[index] ?? seeds.at(-1);
        const maxX = Math.max(
            WALL_PADDING,
            fieldRect.width - radius * 2 - WALL_PADDING
        );
        const maxY = Math.max(
            WALL_PADDING,
            fieldRect.height - radius * 2 - WALL_PADDING
        );
        const previousParticle = previousParticleMap.get(blob.id);

        if (previousParticle) {
            return {
                id: blob.id,
                radius,
                x: clamp(previousParticle.x, WALL_PADDING, maxX),
                y: clamp(previousParticle.y, WALL_PADDING, maxY),
                vx: previousParticle.vx,
                vy: previousParticle.vy,
            };
        }

        const splitOffsetX = seed.vx * 22 * (index + 1);
        const splitOffsetY = seed.vy * 22 * (index + 1);
        const velocityX = sourceParticle
            ? sourceParticle.vx + seed.vx * 0.7
            : seed.vx;
        const velocityY = sourceParticle
            ? sourceParticle.vy + seed.vy * 0.7
            : seed.vy;

        if (
            !sourceParticle &&
            phase === 'play' &&
            blob.id === 'play' &&
            titleAtom
        ) {
            const titleAtomRect = titleAtom.getBoundingClientRect();
            const titleAtomCenterX =
                titleAtomRect.left - fieldRect.left + titleAtomRect.width / 2;
            const titleAtomBottom =
                titleAtomRect.bottom -
                fieldRect.top +
                clamp(fieldRect.height * 0.02, 12, 22);

            return {
                id: blob.id,
                radius,
                x: clamp(titleAtomCenterX - radius, WALL_PADDING, maxX),
                y: clamp(titleAtomBottom - radius, WALL_PADDING, maxY),
                vx: 0,
                vy: Math.abs(seed.vy) * 0.55,
            };
        }

        return {
            id: blob.id,
            radius,
            x: clamp(sourceCenterX - radius + splitOffsetX, WALL_PADDING, maxX),
            y: clamp(sourceCenterY - radius + splitOffsetY, WALL_PADDING, maxY),
            vx: velocityX,
            vy: velocityY,
        };
    });
}

function writeParticleStyles(
    particles: readonly BlobParticle[],
    buttons: ReadonlyMap<BlobId, HTMLButtonElement>
) {
    for (const particle of particles) {
        const button = buttons.get(particle.id);

        if (!button) {
            continue;
        }

        button.style.setProperty('--blob-x', `${particle.x}px`);
        button.style.setProperty('--blob-y', `${particle.y}px`);
    }
}

function resolveCollisions(particles: readonly BlobParticle[]) {
    for (let index = 0; index < particles.length; index++) {
        const current = particles[index];

        for (
            let nextIndex = index + 1;
            nextIndex < particles.length;
            nextIndex++
        ) {
            const next = particles[nextIndex];
            const deltaX = next.x + next.radius - (current.x + current.radius);
            const deltaY = next.y + next.radius - (current.y + current.radius);
            const distance = Math.hypot(deltaX, deltaY) || 0.001;
            const minimumDistance =
                current.radius + next.radius + COLLISION_GAP;

            if (distance >= minimumDistance) {
                continue;
            }

            const normalX = deltaX / distance;
            const normalY = deltaY / distance;
            const overlap = (minimumDistance - distance) / 2;

            current.x -= normalX * overlap;
            current.y -= normalY * overlap;
            next.x += normalX * overlap;
            next.y += normalY * overlap;

            const currentNormalVelocity =
                current.vx * normalX + current.vy * normalY;
            const nextNormalVelocity = next.vx * normalX + next.vy * normalY;
            const currentTangentX =
                current.vx - currentNormalVelocity * normalX;
            const currentTangentY =
                current.vy - currentNormalVelocity * normalY;
            const nextTangentX = next.vx - nextNormalVelocity * normalX;
            const nextTangentY = next.vy - nextNormalVelocity * normalY;

            current.vx = currentTangentX + nextNormalVelocity * normalX;
            current.vy = currentTangentY + nextNormalVelocity * normalY;
            next.vx = nextTangentX + currentNormalVelocity * normalX;
            next.vy = nextTangentY + currentNormalVelocity * normalY;
        }
    }
}

function getTitleOrbCollider(
    field: Readonly<HTMLDivElement>,
    titleOrb: Readonly<HTMLDivElement>
): CircleCollider {
    const fieldRect = field.getBoundingClientRect();
    const orbRect = titleOrb.getBoundingClientRect();

    return {
        centerX: orbRect.left - fieldRect.left + orbRect.width / 2,
        centerY: orbRect.top - fieldRect.top + orbRect.height / 2,
        radius: orbRect.width / 2,
    };
}

function resolveTitleOrbCollision(
    particles: readonly BlobParticle[],
    collider: Readonly<CircleCollider>
) {
    for (const particle of particles) {
        const particleCenterX = particle.x + particle.radius;
        const particleCenterY = particle.y + particle.radius;
        const deltaX = particleCenterX - collider.centerX;
        const deltaY = particleCenterY - collider.centerY;
        const distance = Math.hypot(deltaX, deltaY) || 0.001;
        const minimumDistance =
            collider.radius + particle.radius + COLLISION_GAP;

        if (distance >= minimumDistance) {
            continue;
        }

        const normalX = deltaX / distance;
        const normalY = deltaY / distance;
        const overlap = minimumDistance - distance;
        const currentNormalVelocity =
            particle.vx * normalX + particle.vy * normalY;

        particle.x += normalX * overlap;
        particle.y += normalY * overlap;

        if (currentNormalVelocity < 0) {
            particle.vx -= 2 * currentNormalVelocity * normalX;
            particle.vy -= 2 * currentNormalVelocity * normalY;
        }
    }
}

function clampParticlePosition(
    x: number,
    y: number,
    radius: number,
    fieldRect: Readonly<DOMRect>
): { x: number; y: number } {
    const maxX = Math.max(
        WALL_PADDING,
        fieldRect.width - radius * 2 - WALL_PADDING
    );
    const maxY = Math.max(
        WALL_PADDING,
        fieldRect.height - radius * 2 - WALL_PADDING
    );

    return {
        x: clamp(x, WALL_PADDING, maxX),
        y: clamp(y, WALL_PADDING, maxY),
    };
}

export function MenuScreen({
    onStartSingleGame,
    onStartCreateRoomFlow,
    onStartJoinRoomFlow,
}: MenuScreenProps): JSX.Element {
    const [phase, setPhase] = useState<MenuPhase>('play');
    const [isPlayIntroActive, setIsPlayIntroActive] = useState(true);
    const fieldRef = useRef<HTMLDivElement | null>(null);
    const titleOrbRef = useRef<HTMLDivElement | null>(null);
    const titleAtomRef = useRef<HTMLSpanElement | null>(null);
    const buttonRefs = useRef(new Map<BlobId, HTMLButtonElement>());
    const particlesRef = useRef<BlobParticle[]>([]);
    const frameRef = useRef<number | undefined>(undefined);
    const lastTimeRef = useRef<number>(0);
    const splitSourceRef = useRef<BlobId | undefined>(undefined);
    const activeDragRef = useRef<ActiveDrag | undefined>(undefined);
    const suppressClickRef = useRef<BlobId | undefined>(undefined);

    const transitionToPhase = (
        nextPhase: MenuPhase,
        sourceId: BlobId
    ): void => {
        splitSourceRef.current = sourceId;
        setPhase(nextPhase);
    };

    const blobs = useMemo<BlobDefinition[]>(() => {
        const soloBlob: BlobDefinition = {
            id: 'solo',
            label: uiText.menuSolo,
            icon: Sword,
            onClick: onStartSingleGame,
            tone: 'solo',
        };

        if (phase === 'play') {
            return [
                {
                    id: 'play',
                    label: uiText.menuPlay,
                    icon: Play,
                    onClick: () => {
                        transitionToPhase('mode-select', 'play');
                    },
                    tone: 'play',
                },
            ];
        }

        if (phase === 'mode-select') {
            return [
                soloBlob,
                {
                    id: 'dual',
                    label: uiText.menuDual,
                    icon: Swords,
                    onClick: () => {
                        transitionToPhase('multiplayer-select', 'dual');
                    },
                    tone: 'dual',
                },
            ];
        }

        return [
            soloBlob,
            {
                id: 'create-room',
                label: uiText.menuNewRoom,
                icon: Plus,
                onClick: onStartCreateRoomFlow,
                tone: 'create',
            },
            {
                id: 'join-room',
                label: uiText.menuJoinRoom,
                icon: Search,
                onClick: onStartJoinRoomFlow,
                tone: 'join',
            },
        ];
    }, [phase, onStartCreateRoomFlow, onStartJoinRoomFlow, onStartSingleGame]);

    const updateDraggedParticle = (
        blobId: BlobId,
        clientX: number,
        clientY: number,
        timestamp: number
    ): void => {
        const field = fieldRef.current;
        const activeDrag = activeDragRef.current;

        if (!field || !activeDrag || activeDrag.blobId !== blobId) {
            return;
        }

        const particle = particlesRef.current.find(
            (currentParticle) => currentParticle.id === blobId
        );

        if (!particle) {
            return;
        }

        const fieldRect = field.getBoundingClientRect();
        const nextX = clientX - fieldRect.left - activeDrag.offsetX;
        const nextY = clientY - fieldRect.top - activeDrag.offsetY;
        const clampedPosition = clampParticlePosition(
            nextX,
            nextY,
            particle.radius,
            fieldRect
        );
        const elapsed = Math.max(timestamp - activeDrag.lastTimestamp, 16);
        const deltaScale = 16.667 / elapsed;

        particle.x = clampedPosition.x;
        particle.y = clampedPosition.y;
        particle.vx = (clientX - activeDrag.lastClientX) * 0.06 * deltaScale;
        particle.vy = (clientY - activeDrag.lastClientY) * 0.06 * deltaScale;

        activeDrag.x = clampedPosition.x;
        activeDrag.y = clampedPosition.y;
        activeDrag.moved ||=
            Math.hypot(
                clientX - activeDrag.startClientX,
                clientY - activeDrag.startClientY
            ) >= DRAG_THRESHOLD_PX;
        activeDrag.lastClientX = clientX;
        activeDrag.lastClientY = clientY;
        activeDrag.lastTimestamp = timestamp;

        writeParticleStyles(particlesRef.current, buttonRefs.current);
    };

    const handleBlobPointerDown = (
        blobId: BlobId,
        event: React.PointerEvent<HTMLButtonElement>
    ): void => {
        const field = fieldRef.current;
        const button = buttonRefs.current.get(blobId);
        const particle = particlesRef.current.find(
            (currentParticle) => currentParticle.id === blobId
        );

        if (!field || !button || !particle) {
            return;
        }

        const fieldRect = field.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();

        activeDragRef.current = {
            blobId,
            pointerId: event.pointerId,
            x: particle.x,
            y: particle.y,
            offsetX: event.clientX - buttonRect.left,
            offsetY: event.clientY - buttonRect.top,
            startClientX: event.clientX,
            startClientY: event.clientY,
            lastClientX: event.clientX,
            lastClientY: event.clientY,
            lastTimestamp: event.timeStamp,
            moved: false,
        };
        suppressClickRef.current = undefined;

        const clampedPosition = clampParticlePosition(
            buttonRect.left - fieldRect.left,
            buttonRect.top - fieldRect.top,
            particle.radius,
            fieldRect
        );

        particle.x = clampedPosition.x;
        particle.y = clampedPosition.y;
        particle.vx = 0;
        particle.vy = 0;

        button.setPointerCapture(event.pointerId);
        writeParticleStyles(particlesRef.current, buttonRefs.current);
    };

    const handleBlobPointerMove = (
        blobId: BlobId,
        event: React.PointerEvent<HTMLButtonElement>
    ): void => {
        const activeDrag = activeDragRef.current;

        if (!activeDrag || activeDrag.blobId !== blobId) {
            return;
        }

        if (activeDrag.pointerId !== event.pointerId) {
            return;
        }

        event.preventDefault();
        updateDraggedParticle(
            blobId,
            event.clientX,
            event.clientY,
            event.timeStamp
        );
    };

    const endBlobDrag = (
        blobId: BlobId,
        pointerId: number,
        releasePointerCapture: (() => void) | undefined
    ): void => {
        const activeDrag = activeDragRef.current;

        if (!activeDrag || activeDrag.blobId !== blobId) {
            return;
        }

        if (activeDrag.pointerId !== pointerId) {
            return;
        }

        if (activeDrag.moved) {
            suppressClickRef.current = blobId;
        }

        releasePointerCapture?.();
        activeDragRef.current = undefined;
    };

    useLayoutEffect(() => {
        const field = fieldRef.current;

        if (!field) {
            return undefined;
        }

        const initializeParticles = (): void => {
            const buttons = buttonRefs.current;
            particlesRef.current = [
                ...seedParticles(
                    blobs,
                    phase,
                    field,
                    titleAtomRef.current,
                    buttons,
                    particlesRef.current,
                    splitSourceRef.current
                ),
            ];
            splitSourceRef.current = undefined;
            writeParticleStyles(particlesRef.current, buttons);
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
            const centerX = fieldRect.width / 2;
            const centerY = fieldRect.height / 2;
            const particles = particlesRef.current;
            const titleOrbCollider = getTitleOrbCollider(
                currentField,
                currentTitleOrb
            );
            const activeDrag = activeDragRef.current;

            for (const particle of particles) {
                if (activeDrag && particle.id === activeDrag.blobId) {
                    particle.x = activeDrag.x;
                    particle.y = activeDrag.y;
                    continue;
                }

                const particleCenterX = particle.x + particle.radius;
                const particleCenterY = particle.y + particle.radius;
                const pullX = (centerX - particleCenterX) / fieldRect.width;
                const pullY = (centerY - particleCenterY) / fieldRect.height;

                particle.vx += pullX * 0.009 * delta;
                particle.vy += pullY * 0.009 * delta;

                const speed = Math.hypot(particle.vx, particle.vy) || MIN_SPEED;
                const clampedSpeed = clamp(speed, MIN_SPEED, MAX_SPEED);

                particle.vx = (particle.vx / speed) * clampedSpeed;
                particle.vy = (particle.vy / speed) * clampedSpeed;
                particle.x += particle.vx * delta;
                particle.y += particle.vy * delta;

                const maxX = Math.max(
                    WALL_PADDING,
                    fieldRect.width - particle.radius * 2 - WALL_PADDING
                );
                const maxY = Math.max(
                    WALL_PADDING,
                    fieldRect.height - particle.radius * 2 - WALL_PADDING
                );

                if (particle.x <= WALL_PADDING || particle.x >= maxX) {
                    particle.x = clamp(particle.x, WALL_PADDING, maxX);
                    particle.vx *= -1;
                }

                if (particle.y <= WALL_PADDING || particle.y >= maxY) {
                    particle.y = clamp(particle.y, WALL_PADDING, maxY);
                    particle.vy *= -1;
                }
            }

            resolveTitleOrbCollision(particles, titleOrbCollider);
            resolveCollisions(particles);

            if (activeDrag) {
                const draggedParticle = particles.find(
                    (particle) => particle.id === activeDrag.blobId
                );

                if (draggedParticle) {
                    draggedParticle.x = activeDrag.x;
                    draggedParticle.y = activeDrag.y;
                }
            }

            writeParticleStyles(particles, buttonRefs.current);
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
    }, [blobs, phase]);

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen screen-menu'>
                <div className='menu-stack'>
                    <div
                        aria-label={uiText.title}
                        className='menu-title-orb'
                        ref={titleOrbRef}
                    >
                        <h1 className='hero-title'>
                            <span>{uiText.titleLead}</span>
                            <span
                                aria-hidden='true'
                                className='hero-title-filled-o'
                                ref={titleAtomRef}
                            />
                            <span>{uiText.titleTail}</span>
                        </h1>
                    </div>

                    <div className='menu-actions-shell'>
                        <div
                            aria-label={uiText.title}
                            className='menu-actions'
                            ref={fieldRef}
                            role='group'
                        >
                            {blobs.map((blob) => {
                                const Icon = blob.icon;

                                return (
                                    <button
                                        className={`menu-blob-button menu-blob-${blob.tone}${
                                            blob.id === 'play' &&
                                            phase === 'play' &&
                                            isPlayIntroActive
                                                ? ' menu-blob-play-intro'
                                                : ''
                                        }`}
                                        key={blob.id}
                                        onAnimationEnd={() => {
                                            if (blob.id === 'play') {
                                                setIsPlayIntroActive(false);
                                            }
                                        }}
                                        onClick={(event) => {
                                            if (
                                                suppressClickRef.current ===
                                                blob.id
                                            ) {
                                                suppressClickRef.current =
                                                    undefined;
                                                event.preventDefault();
                                                return;
                                            }

                                            blob.onClick();
                                        }}
                                        onPointerCancel={(event) => {
                                            endBlobDrag(
                                                blob.id,
                                                event.pointerId,
                                                () => {
                                                    event.currentTarget.releasePointerCapture(
                                                        event.pointerId
                                                    );
                                                }
                                            );
                                        }}
                                        onPointerDown={(event) => {
                                            handleBlobPointerDown(
                                                blob.id,
                                                event
                                            );
                                        }}
                                        onPointerMove={(event) => {
                                            handleBlobPointerMove(
                                                blob.id,
                                                event
                                            );
                                        }}
                                        onPointerUp={(event) => {
                                            endBlobDrag(
                                                blob.id,
                                                event.pointerId,
                                                () => {
                                                    event.currentTarget.releasePointerCapture(
                                                        event.pointerId
                                                    );
                                                }
                                            );
                                        }}
                                        ref={(element) => {
                                            if (element) {
                                                buttonRefs.current.set(
                                                    blob.id,
                                                    element
                                                );
                                                return;
                                            }

                                            buttonRefs.current.delete(blob.id);
                                        }}
                                        type='button'
                                    >
                                        <Icon
                                            aria-hidden='true'
                                            className='menu-blob-icon'
                                        />
                                        <span className='menu-blob-text'>
                                            {blob.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
