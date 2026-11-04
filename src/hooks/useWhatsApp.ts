import { useCallback } from "react";
import { siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";

/** Devuelve una función que genera el enlace de WhatsApp Business con un mensaje. */
export function useWhatsApp() {
  return useCallback((message: string) => whatsappUrl(siteConfig.whatsappNumber, message), []);
}
