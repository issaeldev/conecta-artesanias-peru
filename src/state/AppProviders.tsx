import type { ReactNode } from "react";
import { I18nProvider } from "@/i18n/I18nProvider";
import { CatalogProvider } from "./CatalogProvider";
import { CartProvider } from "./CartProvider";
import { CurrencyProvider } from "./CurrencyProvider";
import { ProductModalProvider } from "./ProductModalProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <CatalogProvider>
        <CurrencyProvider>
          <CartProvider>
            <ProductModalProvider>{children}</ProductModalProvider>
          </CartProvider>
        </CurrencyProvider>
      </CatalogProvider>
    </I18nProvider>
  );
}
