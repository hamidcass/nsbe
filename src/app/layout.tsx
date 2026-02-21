import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NSBE — AI Accessibility Remediation",
  description:
    "Scan, fix, and report on web accessibility with AODA/WCAG support. Human-in-the-loop. Pay per scan with XRPL.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
