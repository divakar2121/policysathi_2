import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { clsx } from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PolicySaathi - India's Health Insurance AI Assistant",
  description: "AI-powered health insurance guidance. Analyze policies, claims, and get expert advocacy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={clsx(inter.className, "min-h-screen")}>
        {children}
      </body>
    </html>
  );
}
