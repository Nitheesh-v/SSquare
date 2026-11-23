import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { QuoteModalProvider } from "@/components/QuoteModalContext";
import { COMPANY_INFO } from "@/data/company";

export const metadata: Metadata = {
  title: {
    default: `${COMPANY_INFO.name} | Custom Rubber, Steel & Aluminium Manufacturing`,
    template: `%s | ${COMPANY_INFO.name}`,
  },
  description:
    "Custom manufacturer and global supplier specializing in precision Rubber, Stainless Steel, and Aluminium components in Coimbatore, India. 100% spec conformity and free 3–4 day global door delivery via DHL & FedEx.",
  keywords: [
    "S Square Engineering Services",
    "Custom Molded Rubber Parts",
    "Metal to Rubber Bonded Seals",
    "Viton Gaskets",
    "Silicone Seals",
    "Stainless Steel CNC Machining",
    "Aluminium Die Molds",
    "6061 Aluminium Parts",
    "Coimbatore Engineering Manufacturer",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f8f9fb] text-carbon-900 antialiased">
        <QuoteModalProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </QuoteModalProvider>
      </body>
    </html>
  );
}
