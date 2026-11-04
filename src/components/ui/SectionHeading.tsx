import type { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

interface SectionHeadingProps {
  title: ReactNode;
  sub?: ReactNode;
}

/** Título de sección (con la franja de colores debajo) y bajada opcional. */
export function SectionHeading({ title, sub }: SectionHeadingProps) {
  const { ref, revealClass } = useReveal<HTMLHeadingElement>();
  return (
    <>
      <h2 ref={ref} className={revealClass || undefined}>
        {title}
      </h2>
      {sub && <p className="sub">{sub}</p>}
    </>
  );
}
