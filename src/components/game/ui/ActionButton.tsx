import type { ButtonHTMLAttributes, JSX } from 'react';

import './ActionButton.css';

type ActionButtonProps = {
    variant: 'primary' | 'secondary' | 'danger';
    shape?: 'default' | 'rounded';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ActionButton({
    variant,
    shape,
    className,
    type = 'button',
    ...props
}: ActionButtonProps): JSX.Element {
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

    return <button className={classes} type={type} {...props} />;
}
