import { useRef } from 'react';
import type {
    ButtonHTMLAttributes,
    JSX,
    KeyboardEvent,
    PointerEvent,
    TouchEvent,
} from 'react';

import './ActionButton.css';

type ActionButtonProps = {
    onPress?: () => void;
    variant: 'primary' | 'secondary' | 'danger';
    shape?: 'default' | 'rounded';
    triggerMode?: 'click' | 'press-start';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ActionButton({
    disabled,
    variant,
    shape,
    className,
    onClick,
    onKeyDown,
    onPointerDown,
    onPress,
    onTouchStart,
    triggerMode = 'click',
    type = 'button',
    ...props
}: ActionButtonProps): JSX.Element {
    const suppressNextClickRef = useRef(false);
    let variantClass = 'secondary-action';

    if (variant === 'primary') {
        variantClass = 'primary-action';
    } else if (variant === 'danger') {
        variantClass = 'danger-action';
    }

    const classes = [
        'app-action-button',
        variantClass,
        shape === 'rounded' ? 'action-button-rounded' : undefined,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    function triggerImmediatePress() {
        if (disabled || onPress === undefined) {
            return;
        }

        suppressNextClickRef.current = true;

        globalThis.setTimeout(
            () => {
                onPress();
            },
            0,
            undefined
        );
    }

    function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
        onPointerDown?.(event);

        if (
            event.defaultPrevented ||
            triggerMode !== 'press-start' ||
            event.pointerType === 'touch' ||
            event.pointerType === 'pen' ||
            event.button !== 0
        ) {
            return;
        }

        triggerImmediatePress();
    }

    function handleTouchStart(event: TouchEvent<HTMLButtonElement>) {
        onTouchStart?.(event);

        if (event.defaultPrevented || triggerMode !== 'press-start') {
            return;
        }

        triggerImmediatePress();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        onKeyDown?.(event);

        if (
            event.defaultPrevented ||
            triggerMode !== 'press-start' ||
            disabled ||
            (event.key !== 'Enter' && event.key !== ' ')
        ) {
            return;
        }

        event.preventDefault();
        onPress?.();
    }

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        if (triggerMode === 'press-start' && suppressNextClickRef.current) {
            suppressNextClickRef.current = false;
            event.preventDefault();
            return;
        }

        onClick?.(event);
    }

    return (
        <button
            className={classes}
            disabled={disabled}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onTouchStart={handleTouchStart}
            type={type}
            {...props}
        />
    );
}
