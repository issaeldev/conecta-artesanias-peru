import { useMemo } from "react";
import qrcode from "qrcode-generator";

/** Código QR en SVG (nítido al imprimir). typeNumber 0 = tamaño automático según el texto. */
export function QrCode({ text, label, size = 132 }: { text: string; label: string; size?: number }) {
  const svg = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  }, [text]);

  return (
    <div
      className="qr"
      role="img"
      aria-label={label}
      style={{ width: size, height: size }}
      // SVG generado localmente por la librería a partir de nuestro propio enlace.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
