import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active = false, className = "", type = "button", ...rest }: ChipProps) {
  const classes = ["chip", active ? "on" : "", className].filter(Boolean).join(" ");
  return <button type={type} className={classes} aria-pressed={active || undefined} {...rest} />;
}
