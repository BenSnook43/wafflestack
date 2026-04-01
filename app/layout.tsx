import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "WaffleStack — Your personalised morning briefing",
  description: "A curated daily email digest, personalised to you. Weather, news, markets — delivered every morning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-waffle-cream text-waffle-brown antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
