import type { ButtonHTMLAttributes } from "react";

type ActionButtonProps = {
  variant: "primary" | "secondary";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ActionButton({ variant, className, type = "button", ...props }: ActionButtonProps) {
  const classes = ["app-action-button", variant === "primary" ? "primary-action" : "secondary-action", className]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classes} {...props} />;
}
