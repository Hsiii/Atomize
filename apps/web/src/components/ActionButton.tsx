import type { ButtonHTMLAttributes, JSX } from 'react';

import './ActionButton.css';

type ActionButtonProps = {
    variant: 'primary' | 'secondary';
    shape?: 'default' | 'rounded';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ActionButton({
    variant,
    shape,
    className,
    type = 'button',
    ...props
}: ActionButtonProps): JSX.Element {
    const classes = [
        'app-action-button',
        variant === 'primary' ? 'primary-action' : 'secondary-action',
        shape === 'rounded' ? 'action-button-rounded' : undefined,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return <button className={classes} type={type} {...props} />;
}
