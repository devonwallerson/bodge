import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bodge — an idea worth building",
  description: "Five questions. Three useful ideas with a funny twist.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const themeBoot = `(function(){try{var t=localStorage.getItem('bodge-theme');if(['terminal','magenta','indigo','blue','matcha'].includes(t))document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="terminal" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBoot }} /></head>
      <body>{children}</body>
    </html>
  );
}
