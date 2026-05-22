import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nutrizione24.store"),
  title: "Nano Slim | Nutrizione24",
  description:
    "Nano Slim landing page with a lightweight lead form flow rebuilt without WordPress.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nano Slim | Nutrizione24",
    description:
      "Nano Slim landing page with a lightweight lead form flow rebuilt without WordPress.",
    url: "/",
    siteName: "Nutrizione24",
    type: "website",
    images: ["/assets/product.png"],
  },
  icons: {
    icon: "/assets/favicon.png",
    apple: "/assets/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
