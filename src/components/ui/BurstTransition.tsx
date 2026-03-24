import { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { uiText } from '../../app-state';
import './BurstTransition.css';

type BurstTransitionProps = {
    onNavigate: () => void;
    onComplete: () => void;
};

export function BurstTransition({ onNavigate, onComplete }: BurstTransitionProps): JSX.Element {
    const [gameWipeScale, setGameWipeScale] = useState(0);
    const [opacityState, setOpacityState] = useState(0);
    const [transitionDuration, setTransitionDuration] = useState('0.4s');
    
    // Store latest callbacks safely
    const onNavigateRef = useRef(onNavigate);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onNavigateRef.current = onNavigate;
        onCompleteRef.current = onComplete;
    }, [onNavigate, onComplete]);
    
    useEffect(() => {
        // Trigger the Fade-In overlay dynamically onto the paint cycle
        const timeoutFadeIn = setTimeout(() => {
            setOpacityState(1);
        }, 10);
        
        // Start the wipe almost immediately (50ms to ensure edge detection), overlapping with the fade-in
        const timeoutScale = setTimeout(() => {
            setGameWipeScale(40);
        }, 50);
        
        // Navigation buffer accounting for 1.2s hardware accelerated CSS wipe transition + 50ms delay
        const timeoutNav = setTimeout(() => {
            onNavigateRef.current();
            
            // Allow router DOM mounting gap, then execute the symmetrical Fade Out
            setTimeout(() => {
                setTransitionDuration('0.6s');
                setOpacityState(0);
            }, 100);
        }, 1250); // 1200 + 50ms offset
        
        const timeoutEnd = setTimeout(() => {
            onCompleteRef.current();
        }, 2050); // 1250 + 100 + 700 ease (padding)
        
        return () => {
            clearTimeout(timeoutFadeIn);
            clearTimeout(timeoutScale);
            clearTimeout(timeoutNav);
            clearTimeout(timeoutEnd);
        };
    }, []);

    return (
        <div 
            className='burst-transition-screen'
            style={{ 
                opacity: opacityState, 
                transition: `opacity ${transitionDuration} ease-in-out` 
            }}
        >
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
            
            {/* Hardware Accelerated Final ATOMIZE Reveal Overlay */}
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
                    color: 'var(--color-primary)', 
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
    );
}
