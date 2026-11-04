import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

interface CardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Aparición al entrar en pantalla (por defecto sí). */
  reveal?: boolean;
}

export function Card({ children, className = "", id, style, reveal = true }: CardProps) {
  const { ref, revealClass } = useReveal<HTMLDivElement>();
  const classes = ["card", className, reveal ? revealClass : ""].filter(Boolean).join(" ");
  return (
    <div ref={reveal ? ref : undefined} id={id} className={classes} style={style}>
      {children}
    </div>
  );
}
