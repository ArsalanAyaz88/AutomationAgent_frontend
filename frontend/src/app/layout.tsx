import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube Ops Command Center | Mission Control",
  description: "Tactical YouTube Automation - 6 AI Agents for Content Warfare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-military-dark text-military-green font-military antialiased">
        <div className="scan-line" />
        {children}
      </body>
    </html>
  );
}
