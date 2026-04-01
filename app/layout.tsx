import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "WaffleStack — Your personalised morning briefing",
  description: "A curated daily email digest, personalised to you. Weather, news, markets — delivered every morning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-amber-50 text-gray-900 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
