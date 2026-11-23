import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/store/providers";
import { CartDrawer } from "@/features/cart/CartDrawer";
import { QuoteSlideOver } from "@/features/checkout/QuoteSlideOver";
import { COMPANY_INFO } from "@/lib/company-data";

export const metadata: Metadata = {
  title: {
    default: `${COMPANY_INFO.name} | Custom Rubber, Steel & Aluminium Manufacturing`,
    template: `%s | ${COMPANY_INFO.name}`,
  },
  description:
    "Custom manufacturer and global supplier specializing in precision Rubber, Stainless Steel, and Aluminium components in Coimbatore, India. 100% spec conformity and free 3–4 day global door delivery via DHL & FedEx.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f8f9fb] text-carbon-900 antialiased">
        <AppProviders>
          {children}
          <CartDrawer />
          <QuoteSlideOver />
        </AppProviders>
      </body>
    </html>
  );
}
