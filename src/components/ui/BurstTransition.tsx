import { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { uiText } from '../../app-state';
import './BurstTransition.css';

type Particle = {
    id: number | string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    isPhysicsReady: boolean;
    mass: number;
    customRender?: JSX.Element;
    element: HTMLElement | null;
    value?: number;
};

type BurstTransitionProps = {
    onComplete: () => void;
};

export function BurstTransition({ onComplete }: BurstTransitionProps): JSX.Element {
    const [isAtomizeCharging, setIsAtomizeCharging] = useState(false);
    const [isAtomizeExploded, setIsAtomizeExploded] = useState(false);
    const [gameWipeScale, setGameWipeScale] = useState(0);
    const [particles, setParticles] = useState<Particle[]>([]);
    const reqRef = useRef<number | undefined>(undefined);
    
    useEffect(() => {
        setIsAtomizeCharging(true);
        
        const timeout1 = setTimeout(() => {
            setIsAtomizeExploded(true);
            
            const primes = [2, 3, 5, 7];
            const numParticles = 40 + Math.floor(Math.random() * 20);
            const containerWidth = window.innerWidth;
            const containerHeight = window.innerHeight;
            
            const generatedParticles: Particle[] = Array.from({ length: numParticles }, (_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const speed = 15 + Math.random() * 25;
                const radius = 18 + Math.random() * 8;
                return {
                    id: `p-${i}`,
                    x: containerWidth / 2,
                    y: containerHeight / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius,
                    mass: radius,
                    isPhysicsReady: true,
                    value: primes[Math.floor(Math.random() * primes.length)],
                    element: null
                };
            });
            
            generatedParticles.push({
                id: 'go-ball',
                x: containerWidth / 2,
                y: containerHeight / 2 - 20,
                vx: (Math.random() - 0.5) * 10,
                vy: -35,
                radius: 80,
                mass: 200,
                isPhysicsReady: true,
                element: null,
                customRender: <>Go !</>
            });
            
            setParticles(generatedParticles);
            
            let lastTime = performance.now();
            
            const tick = (currentTime: number) => {
                const dt = Math.min((currentTime - lastTime) / 16.666, 2.0);
                lastTime = currentTime;
                
                for (let i = 0; i < generatedParticles.length; i++) {
                    const p1 = generatedParticles[i]!;
                    p1.vy += 0.6 * dt; // Gravity
                    
                    p1.x += p1.vx * dt;
                    p1.y += p1.vy * dt;
                    
                    if (p1.x - p1.radius < 0) { p1.x = p1.radius; p1.vx *= -0.7; }
                    if (p1.x + p1.radius > containerWidth) { p1.x = containerWidth - p1.radius; p1.vx *= -0.7; }
                    if (p1.y - p1.radius < 0) { p1.y = p1.radius; p1.vy *= -0.7; }
                    if (p1.y + p1.radius > containerHeight) { 
                        p1.y = containerHeight - p1.radius; 
                        p1.vy *= -0.6;
                        p1.vx *= 0.95; // Friction
                    }
                    
                    for (let j = i + 1; j < generatedParticles.length; j++) {
                        const p2 = generatedParticles[j]!;
                        const dx = p2.x - p1.x;
                        const dy = p2.y - p1.y;
                        const dist = Math.hypot(dx, dy);
                        const minDist = p1.radius + p2.radius;
                        
                        if (dist < minDist && dist > 0.001) {
                            const overlap = minDist - dist;
                            const nx = dx / dist;
                            const ny = dy / dist;
                            
                            const totalMass = p1.mass + p2.mass;
                            const m1Ratio = p2.mass / totalMass;
                            const m2Ratio = p1.mass / totalMass;
                            
                            p1.x -= nx * overlap * m1Ratio;
                            p1.y -= ny * overlap * m1Ratio;
                            p2.x += nx * overlap * m2Ratio;
                            p2.y += ny * overlap * m2Ratio;
                            
                            const rvx = p2.vx - p1.vx;
                            const rvy = p2.vy - p1.vy;
                            const velAlongNormal = rvx * nx + rvy * ny;
                            
                            if (velAlongNormal < 0) {
                                const restitution = 0.6;
                                const impulse = -(1 + restitution) * velAlongNormal / (1 / p1.mass + 1 / p2.mass);
                                const forceX = impulse * nx;
                                const forceY = impulse * ny;
                                
                                p1.vx -= forceX / p1.mass;
                                p1.vy -= forceY / p1.mass;
                                p2.vx += forceX / p2.mass;
                                p2.vy += forceY / p2.mass;
                            }
                        }
                    }
                    
                    if (p1.element) {
                        p1.element.style.transform = `translate(${p1.x - p1.radius}px, ${p1.y - p1.radius}px)`;
                    }
                }
                
                reqRef.current = requestAnimationFrame(tick);
            };
            
            reqRef.current = requestAnimationFrame(tick);
        }, 1500);
        
        const timeout2 = setTimeout(() => {
            setGameWipeScale(40);
        }, 3300);
        
        const timeout3 = setTimeout(() => {
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
            onComplete();
        }, 4500);
        
        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            clearTimeout(timeout3);
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, [onComplete]);

    return (
        <div className='burst-transition-screen'>
            <div className='burst-particles-wrapper' style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                {!isAtomizeExploded && (
                    <div className={`burst-big-circle ${isAtomizeCharging ? 'charging' : ''}`}>
                        <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.035em',
                            fontFamily: 'var(--type-display-hero-family)',
                            fontWeight: 'var(--type-display-hero-weight)',
                            letterSpacing: 'var(--type-display-hero-letter-spacing)',
                            textTransform: 'var(--type-display-hero-text-transform)',
                        }}>
                            <span>{uiText.titleLead}</span>
                            <span aria-hidden='true' style={{ 
                                width: '0.66em', height: '0.66em', flex: '0 0 0.66em', 
                                borderRadius: '50%', background: 'currentColor', 
                                transform: 'translateY(-0.015em)' 
                            }} />
                            <span>{uiText.titleTail}</span>
                        </div>
                    </div>
                )}
                {particles.map((p) => (
                    <div 
                        key={p.id} 
                        className={p.id === 'go-ball' ? 'burst-go-ball' : 'burst-small-circle'} 
                        ref={(el) => { p.element = el; }}
                        style={{ 
                            position: 'absolute',
                            top: 0, left: 0,
                            width: `${p.radius * 2}px`, 
                            height: `${p.radius * 2}px`,
                            transform: `translate(${p.x - p.radius}px, ${p.y - p.radius}px)`,
                            zIndex: p.id === 'go-ball' ? 10 : 1,
                        }}
                    >
                        {p.customRender || p.value}
                    </div>
                ))}
                {/* GPU Accelerated Circle Wipe Wipe */}
                <div 
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: '10vw',
                        height: '10vw',
                        marginLeft: '-5vw',
                        marginTop: '-5vw',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-page-bg)',
                        transform: `scale(${gameWipeScale})`,
                        transition: 'transform 1.2s cubic-bezier(0.85, 0, 0.15, 1)',
                        zIndex: 100,
                        pointerEvents: 'none'
                    }}
                />
                {/* Hardware Accelerated ATOMIZE Reveal */}
                <div 
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-ink)', 
                        zIndex: 101, // Above the wipe circle
                        opacity: gameWipeScale > 0 ? 1 : 0, // Appears exactly when wipe starts
                        transition: 'opacity 0.6s ease-out', // Fades in smoothly
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.035em',
                        fontFamily: 'var(--type-display-hero-family)',
                        fontWeight: 'var(--type-display-hero-weight)',
                        letterSpacing: 'var(--type-display-hero-letter-spacing)',
                        textTransform: 'var(--type-display-hero-text-transform)',
                        fontSize: 'min(14vw, 6rem)'
                    }}>
                        <span>{uiText.titleLead}</span>
                        <span aria-hidden='true' style={{ 
                            width: '0.66em', height: '0.66em', flex: '0 0 0.66em', 
                            borderRadius: '50%', background: 'currentColor', 
                            transform: 'translateY(-0.015em)' 
                        }} />
                        <span>{uiText.titleTail}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
