import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} | Typing Learning & Competition Platform`,
  description: `Improve typing speed and accuracy on ${APP_NAME}. Play multiplayer typing battles, practice coding exercises, and level up your skills.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cyber-dark text-slate-100 font-sans">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
