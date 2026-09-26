import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hoichoi AI Content Studio",
  description:
    "AI-powered content operations and multi-platform command center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
