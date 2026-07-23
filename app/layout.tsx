import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PerfPilot — Your AI Performance Engineer",
  description: "Continuous performance review for AI inference on Arm.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
