import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import type { ChangeEvent, JSX, KeyboardEvent } from 'react';
import { ArrowLeft, Check, Copy, Search } from 'lucide-react';

import type { MenuMode, MultiplayerState, OnlineLobbyUser } from '../app-state';
import { uiText } from '../app-state';

import './MultiplayerLobbyScreen.css';

import { BackButton } from './BackButton';

type MultiplayerLobbyScreenProps = {
    menuMode: MenuMode;
    multiplayer: MultiplayerState;
    multiplayerCountdownValue: number | null;
    transientToastId: number;
    transientToastMessage: string | null;
    isJoinPending: boolean;
    roomIdInput: string;
    onlineUsers: OnlineLobbyUser[];
    onBack: () => void | Promise<void>;
    onRoomIdInputChange: (value: string) => void;
    onJoinRoom: () => void | Promise<void>;
    onCreateRoom: () => void | Promise<void>;
    onInvitePlayer: (targetPlayerId: string) => void | Promise<void>;
};

type JoinBlobId = 'code' | 'go';

type JoinBlobParticle = {
    id: JoinBlobId;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
};

type JoinCircleCollider = {
    centerX: number;
    centerY: number;
    radius: number;
};

const JOIN_COLLISION_GAP = 4;
const JOIN_TITLE_ORB_CLEARANCE = 6;
const JOIN_WALL_PADDING = 0;
const JOIN_MIN_SPEED = 0.15;
const JOIN_MAX_SPEED = 0.36;

function clampJoinValue(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function writeJoinParticleStyles(
    particles: readonly JoinBlobParticle[],
    elements: ReadonlyMap<JoinBlobId, HTMLElement>
) {
    for (const particle of particles) {
        const element = elements.get(particle.id);

        if (!element) {
            continue;
        }

        element.style.setProperty('--join-blob-x', `${particle.x}px`);
        element.style.setProperty('--join-blob-y', `${particle.y}px`);
    }
}

function getJoinTitleOrbCollider(
    field: Readonly<HTMLDivElement>,
    orb: Readonly<HTMLDivElement>
): JoinCircleCollider {
    const fieldRect = field.getBoundingClientRect();
    const orbRect = orb.getBoundingClientRect();

    return {
        centerX: orbRect.left - fieldRect.left + orbRect.width / 2,
        centerY: orbRect.top - fieldRect.top + orbRect.height / 2,
        radius: orbRect.width / 2,
    };
}

function clampJoinParticleOutsideCollider(
    x: number,
    y: number,
    radius: number,
    collider: Readonly<JoinCircleCollider>
): { x: number; y: number } {
    const centerX = x + radius;
    const centerY = y + radius;
    const deltaX = centerX - collider.centerX;
    const deltaY = centerY - collider.centerY;
    const distance = Math.hypot(deltaX, deltaY) || 0.001;
    const minimumDistance = collider.radius + radius + JOIN_TITLE_ORB_CLEARANCE;

    if (distance >= minimumDistance) {
        return { x, y };
    }

    const normalX = deltaX / distance;
    const normalY = deltaY / distance;
    const pushedCenterX = collider.centerX + normalX * minimumDistance;
    const pushedCenterY = collider.centerY + normalY * minimumDistance;

    return {
        x: pushedCenterX - radius,
        y: pushedCenterY - radius,
    };
}

function resolveJoinTitleOrbCollision(
    particles: readonly JoinBlobParticle[],
    collider: Readonly<JoinCircleCollider>
) {
    for (const particle of particles) {
        const particleCenterX = particle.x + particle.radius;
        const particleCenterY = particle.y + particle.radius;
        const deltaX = particleCenterX - collider.centerX;
        const deltaY = particleCenterY - collider.centerY;
        const distance = Math.hypot(deltaX, deltaY) || 0.001;
        const minimumDistance =
            collider.radius + particle.radius + JOIN_TITLE_ORB_CLEARANCE;

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

function resolveJoinBlobCollisions(particles: readonly JoinBlobParticle[]) {
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
                current.radius + next.radius + JOIN_COLLISION_GAP;

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

function seedJoinParticles(
    field: Readonly<HTMLDivElement>,
    titleOrb: Readonly<HTMLDivElement>,
    elements: ReadonlyMap<JoinBlobId, HTMLElement>,
    previousParticles: readonly JoinBlobParticle[]
): readonly JoinBlobParticle[] {
    const fieldRect = field.getBoundingClientRect();
    const collider = getJoinTitleOrbCollider(field, titleOrb);
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
        const clampedX = clampJoinValue(unclampedX, JOIN_WALL_PADDING, maxX);
        const clampedY = clampJoinValue(unclampedY, JOIN_WALL_PADDING, maxY);
        const constrainedPosition = clampJoinParticleOutsideCollider(
            clampedX,
            clampedY,
            radius,
            collider
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

export function MultiplayerLobbyScreen({
    menuMode,
    multiplayer,
    multiplayerCountdownValue,
    transientToastId,
    transientToastMessage,
    isJoinPending,
    roomIdInput,
    onlineUsers,
    onBack,
    onRoomIdInputChange,
    onJoinRoom,
    onCreateRoom,
    onInvitePlayer,
}: MultiplayerLobbyScreenProps): JSX.Element {
    const [localToastMessage, setLocalToastMessage] = useState<
        string | undefined
    >(undefined);
    const [visibleTransientToastMessage, setVisibleTransientToastMessage] =
        useState<string | undefined>(undefined);
    const [codeCopied, setCodeCopied] = useState(false);
    const hasAutoSubmitted = useRef(false);
    const joinFieldRef = useRef<HTMLDivElement | null>(null);
    const joinTitleOrbRef = useRef<HTMLDivElement | null>(null);
    const joinBlobRefs = useRef(new Map<JoinBlobId, HTMLElement>());
    const joinParticlesRef = useRef<JoinBlobParticle[]>([]);
    const joinFrameRef = useRef<number | undefined>(undefined);
    const joinLastTimeRef = useRef(0);
    const isJoinFlow = menuMode === 'join-room';
    const shouldShowWaitingRoom = Boolean(multiplayer.roomId);
    const isJoinButtonReady = roomIdInput.length === 4;
    const activeToastMessage =
        localToastMessage ?? visibleTransientToastMessage;
    let createOrJoinButtonText: string = uiText.createRoom;

    if (isJoinFlow) {
        createOrJoinButtonText = isJoinPending ? uiText.findingRoom : uiText.go;
    }

    const currentPlayer = multiplayer.snapshot?.players.find(
        (player) => player.id === multiplayer.playerId
    );
    const opponentPlayer = multiplayer.snapshot?.players.find(
        (player) => player.id !== multiplayer.playerId
    );
    const isCountdown = multiplayer.snapshot?.status === 'countdown';
    const hasOpponent = Boolean(opponentPlayer);

    function handleActionError() {
        setLocalToastMessage(uiText.serverOffline);
    }

    function runAsyncAction(action: () => void | Promise<void>) {
        Promise.resolve().then(action).catch(handleActionError);
    }

    useEffect(() => {
        if (!localToastMessage) {
            return undefined;
        }

        const timer = globalThis.setTimeout(
            (nextMessage: undefined) => {
                setLocalToastMessage(nextMessage);
            },
            2200,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [localToastMessage]);

    useEffect(() => {
        if (!transientToastMessage) {
            setVisibleTransientToastMessage(undefined);
            return undefined;
        }

        setVisibleTransientToastMessage(transientToastMessage);

        const timer = globalThis.setTimeout(
            (nextMessage: undefined) => {
                setVisibleTransientToastMessage(nextMessage);
            },
            2200,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [transientToastId, transientToastMessage]);

    const submitJoin = useCallback(() => {
        if (!isJoinButtonReady) {
            setLocalToastMessage(uiText.joinIncompleteToast);
            return;
        }

        if (isJoinPending) {
            return;
        }

        runAsyncAction(onJoinRoom);
    }, [isJoinButtonReady, isJoinPending, onJoinRoom]);

    // Reset auto-submit guard only when input changes.
    useEffect(() => {
        if (!isJoinButtonReady) {
            hasAutoSubmitted.current = false;
        }
    }, [isJoinButtonReady]);

    // Auto-submit when four digits are entered.
    useEffect(() => {
        if (
            !isJoinFlow ||
            !isJoinButtonReady ||
            isJoinPending ||
            hasAutoSubmitted.current
        ) {
            return;
        }

        hasAutoSubmitted.current = true;
        submitJoin();
    }, [isJoinFlow, isJoinButtonReady, isJoinPending, submitJoin]);

    function handleCreateOrJoinClick() {
        if (!isJoinFlow) {
            runAsyncAction(onCreateRoom);
            return;
        }

        submitJoin();
    }

    function handleRoomCodeKeyDown(event: KeyboardEvent<HTMLElement>) {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitJoin();
        }
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        onRoomIdInputChange(event.target.value);
    }

    function focusInput() {
        inputRef.current?.focus();
    }

    const inputRef = useRef<HTMLInputElement | null>(null);
    const roomCodeDigits = Array.from(
        { length: 4 },
        (_, index) => roomIdInput[index] ?? ''
    );

    useLayoutEffect(() => {
        if (!isJoinFlow || shouldShowWaitingRoom) {
            return undefined;
        }

        const field = joinFieldRef.current;
        const titleOrb = joinTitleOrbRef.current;

        if (!field || !titleOrb) {
            return undefined;
        }

        const initializeParticles = (): void => {
            joinParticlesRef.current = [
                ...seedJoinParticles(
                    field,
                    titleOrb,
                    joinBlobRefs.current,
                    joinParticlesRef.current
                ),
            ];
            writeJoinParticleStyles(
                joinParticlesRef.current,
                joinBlobRefs.current
            );
        };

        const tick = (time: number): void => {
            const currentField = joinFieldRef.current;
            const currentTitleOrb = joinTitleOrbRef.current;

            if (!currentField || !currentTitleOrb) {
                return;
            }

            const delta = joinLastTimeRef.current
                ? Math.min((time - joinLastTimeRef.current) / 16.667, 1.8)
                : 1;

            joinLastTimeRef.current = time;

            const fieldRect = currentField.getBoundingClientRect();
            const particles = joinParticlesRef.current;
            const titleOrbCollider = getJoinTitleOrbCollider(
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
                const clampedSpeed = clampJoinValue(
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
                    particle.x = clampJoinValue(
                        particle.x,
                        JOIN_WALL_PADDING,
                        maxX
                    );
                    particle.vx *= -1;
                }

                if (particle.y <= JOIN_WALL_PADDING || particle.y >= maxY) {
                    particle.y = clampJoinValue(
                        particle.y,
                        JOIN_WALL_PADDING,
                        maxY
                    );
                    particle.vy *= -1;
                }
            }

            resolveJoinTitleOrbCollision(particles, titleOrbCollider);
            resolveJoinBlobCollisions(particles);
            writeJoinParticleStyles(particles, joinBlobRefs.current);
            joinFrameRef.current = globalThis.requestAnimationFrame(tick);
        };

        initializeParticles();
        joinLastTimeRef.current = 0;
        joinFrameRef.current = globalThis.requestAnimationFrame(tick);

        const resizeObserver = new ResizeObserver(() => {
            initializeParticles();
            joinLastTimeRef.current = 0;
        });

        resizeObserver.observe(field);

        return () => {
            resizeObserver.disconnect();

            if (joinFrameRef.current !== undefined) {
                globalThis.cancelAnimationFrame(joinFrameRef.current);
            }
        };
    }, [isJoinFlow, shouldShowWaitingRoom]);

    function handleCopyCode() {
        if (!multiplayer.roomId) {
            return;
        }

        navigator.clipboard.writeText(multiplayer.roomId).then(
            () => {
                setCodeCopied(true);
                globalThis.setTimeout(
                    () => {
                        setCodeCopied(false);
                    },
                    1500,
                    undefined
                );
            },
            () => undefined
        );
    }

    function handleInvite(targetPlayerId: string) {
        runAsyncAction(async () => {
            await onInvitePlayer(targetPlayerId);
        });
    }

    if (!multiplayer.roomId && !shouldShowWaitingRoom) {
        return (
            <main className='app-shell fullscreen-shell'>
                <BackButton onBack={onBack} />
                <section className='screen lobby-screen join-screen'>
                    <div className='join-layout'>
                        {activeToastMessage ? (
                            <div
                                aria-live='polite'
                                className='join-toast-layer'
                            >
                                <div className='waiting-toast'>
                                    {activeToastMessage}
                                </div>
                            </div>
                        ) : undefined}

                        <div
                            aria-hidden='true'
                            className='join-title-orb'
                            ref={joinTitleOrbRef}
                        >
                            <p className='join-title'>
                                <span>{uiText.joinRoom.split(' ')[0]}</span>
                                <span>{uiText.joinRoom.split(' ')[1]}</span>
                            </p>
                        </div>

                        <div className='join-stage' ref={joinFieldRef}>
                            {/* The hidden input inside handles keyboard interaction. */}
                            <div
                                className='join-orb'
                                onClick={focusInput}
                                onKeyDown={handleRoomCodeKeyDown}
                                ref={(element) => {
                                    if (element) {
                                        joinBlobRefs.current.set(
                                            'code',
                                            element
                                        );
                                        return;
                                    }

                                    joinBlobRefs.current.delete('code');
                                }}
                            >
                                <div
                                    aria-hidden='true'
                                    className='join-orb-bars'
                                >
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
                                onClick={handleCreateOrJoinClick}
                                ref={(element) => {
                                    if (element) {
                                        joinBlobRefs.current.set('go', element);
                                        return;
                                    }

                                    joinBlobRefs.current.delete('go');
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

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen lobby-screen lobby-room'>
                <header className='lobby-bar'>
                    <button
                        className='lobby-bar-back'
                        onClick={() => {
                            runAsyncAction(onBack);
                        }}
                        type='button'
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className='lobby-bar-code'>
                        <span className='lobby-bar-digits'>
                            {multiplayer.roomId}
                        </span>
                        <button
                            className='lobby-bar-copy'
                            onClick={handleCopyCode}
                            type='button'
                        >
                            {codeCopied ? (
                                <Check size={14} />
                            ) : (
                                <Copy size={14} />
                            )}
                        </button>
                    </div>
                </header>

                <div className='lobby-arena'>
                    <div className='arena-player arena-p1'>
                        <span className='arena-label'>P1</span>
                        <span className='arena-name'>
                            {currentPlayer?.name ?? '-'}
                        </span>
                    </div>

                    <div className='arena-center'>
                        <span className='arena-vs'>
                            {isCountdown
                                ? (multiplayerCountdownValue ?? 3)
                                : 'VS'}
                        </span>
                    </div>

                    <div
                        className={`arena-player arena-p2${
                            opponentPlayer ? '' : ' arena-p2-open'
                        }`}
                    >
                        <span className='arena-label'>P2</span>
                        <span
                            className={`arena-name${
                                opponentPlayer ? '' : ' arena-name-waiting'
                            }`}
                        >
                            {opponentPlayer?.name ?? '?'}
                        </span>
                    </div>

                    {!hasOpponent && !isCountdown && onlineUsers.length > 0 ? (
                        <ul className='arena-challengers'>
                            {onlineUsers.map((user) => (
                                <li
                                    className='arena-challenger'
                                    key={user.playerId}
                                >
                                    <span className='arena-challenger-name'>
                                        {user.name}
                                    </span>
                                    <button
                                        className='arena-challenger-invite'
                                        onClick={() => {
                                            handleInvite(user.playerId);
                                        }}
                                        type='button'
                                    >
                                        {uiText.inviteButton}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : undefined}
                </div>

                {activeToastMessage ? (
                    <div aria-live='polite' className='waiting-toast-layer'>
                        <div className='waiting-toast'>
                            {activeToastMessage}
                        </div>
                    </div>
                ) : undefined}
            </section>
        </main>
    );
}
