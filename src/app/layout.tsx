import type { Metadata } from "next";
import "./globals.css";
import { GrainOverlay } from "@/components/GrainOverlay";

export const metadata: Metadata = {
  title: "REST IN READ — Digital Morgue for Dead Texts",
  description: "A satirical digital morgue where you file coroner's reports for ignored text messages, browse a communal graveyard, and get flirted with by needy ghosts via a Ouija board.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚰️</text></svg>"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#090a0f] text-zinc-100 antialiased">
        {/* Grain + vignette overlay — above page, below modals (z-40 vs z-50) */}
        <GrainOverlay />
        {children}
      </body>
    </html>
  );
}
