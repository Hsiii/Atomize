import type { CSSProperties, JSX } from 'react';

import './ConfettiLayer.css';

type ConfettiDot = {
    angle: number;
    distance: number;
    size: number;
    delay: number;
};

const victoryConfetti: readonly ConfettiDot[] = [
    { angle: -30, distance: 16, size: 0.7, delay: 0.12 },
    { angle: 25, distance: 18, size: 0.55, delay: 0.18 },
    { angle: 72, distance: 15, size: 0.65, delay: 0.1 },
    { angle: -80, distance: 17, size: 0.6, delay: 0.22 },
    { angle: 120, distance: 14.5, size: 0.68, delay: 0.15 },
    { angle: -125, distance: 16.5, size: 0.58, delay: 0.2 },
    { angle: 160, distance: 13.5, size: 0.72, delay: 0.13 },
    { angle: -165, distance: 19, size: 0.5, delay: 0.25 },
];

export function ConfettiLayer(): JSX.Element {
    return (
        <div aria-hidden='true' className='confetti-layer'>
            {victoryConfetti.map((particle, index) => (
                <span
                    className='confetti-dot'
                    key={index}
                    style={
                        {
                            '--confetti-angle': `${particle.angle}deg`,
                            '--confetti-distance': `${particle.distance}rem`,
                            '--confetti-size': `${particle.size}rem`,
                            '--confetti-delay': `${particle.delay}s`,
                        } as CSSProperties
                    }
                />
            ))}
        </div>
    );
}
