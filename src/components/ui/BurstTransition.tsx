import { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { uiText } from '../../app-state';
import './BurstTransition.css';

type BurstTransitionProps = {
    onNavigate: () => void;
    onComplete: () => void;
};

export function BurstTransition({ onNavigate, onComplete }: BurstTransitionProps): JSX.Element {
    const [containerOpacity, setContainerOpacity] = useState(1);
    
    // Store latest callbacks safely
    const onNavigateRef = useRef(onNavigate);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onNavigateRef.current = onNavigate;
        onCompleteRef.current = onComplete;
    }, [onNavigate, onComplete]);
    
    useEffect(() => {
        // Navigation buffer (after secondary wipe covers the screen entirely)
        const timeoutNav = setTimeout(() => {
            onNavigateRef.current();
            
            // Allow router DOM mounting gap, then execute the symmetrical Fade Out
            setTimeout(() => {
                setContainerOpacity(0);
            }, 100);
        }, 1250); 
        
        // Complete the transition
        const timeoutEnd = setTimeout(() => {
            onCompleteRef.current();
        }, 1850); 
        
        return () => {
            clearTimeout(timeoutNav);
            clearTimeout(timeoutEnd);
        };
    }, []);

    return (
        <div 
            className='burst-transition-screen'
            style={{ 
                opacity: containerOpacity, 
                transition: 'opacity 0.4s ease-out' 
            }}
        >
            {/* Primary Wipe (Color Primary) extending downwards with exact page header curve */}
            <div className='wipe-group wipe-primary'>
                <div className='wipe-rect' />
                <div className='wipe-circle' />
            </div>

            
            {/* Hardware Accelerated Final ATOMIZE Reveal Overlay */}
            <div className='wipe-text-overlay'>
                <div className='wipe-text-content'>
                    <span>{uiText.titleLead}</span>
                    <span aria-hidden='true' className='wipe-text-orb' />
                    <span>{uiText.titleTail}</span>
                </div>
            </div>
        </div>
    );
}

