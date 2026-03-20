import type { ButtonHTMLAttributes, JSX, ReactNode } from 'react';

import './IconButton.css';

type IconButtonProps = {
    label: string;
    icon: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function IconButton({
    label,
    icon,
    className,
    type = 'button',
    ...props
}: IconButtonProps): JSX.Element {
    const classes = ['icon-action', className].filter(Boolean).join(' ');

    return (
        <button aria-label={label} className={classes} type={type} {...props}>
            {icon}
        </button>
    );
}
