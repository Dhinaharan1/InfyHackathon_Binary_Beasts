import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Debate 2 Decision AI",
  description: "Your AI decision council for every complex question.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen debate-gradient">{children}</body>
    </html>
  );
}
