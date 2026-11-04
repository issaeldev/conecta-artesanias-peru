import { useEffect, useState } from "react";

/** Porcentaje (0–100) de scroll de la página. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const d = document.documentElement;
      setProgress((d.scrollTop / (d.scrollHeight - d.clientHeight || 1)) * 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return progress;
}
