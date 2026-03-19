import type { ButtonHTMLAttributes, JSX } from 'react';

import './ActionButton.css';

type ActionButtonProps = {
    variant: 'primary' | 'secondary';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ActionButton({
    variant,
    className,
    type = 'button',
    ...props
}: ActionButtonProps): JSX.Element {
    const classes = [
        'app-action-button',
        variant === 'primary' ? 'primary-action' : 'secondary-action',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return <button className={classes} type={type} {...props} />;
}
