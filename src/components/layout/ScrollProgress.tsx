import { useScrollProgress } from "@/hooks/useScrollProgress";
import "./ScrollProgress.css";

/** Barra multicolor superior que indica el avance de la lectura. */
export function ScrollProgress() {
  const progress = useScrollProgress();
  return <div id="sp" aria-hidden="true" style={{ width: `${progress}%` }} />;
}
