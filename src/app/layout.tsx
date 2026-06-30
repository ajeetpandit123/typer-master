import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Inter } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { APP_NAME } from "@/lib/config";
import "./tokens.css";
import "./globals.css";
import { Suspense } from "react";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} | Typing Learning & Competition Platform`,
  description: `Improve typing speed and accuracy on ${APP_NAME}. Play multiplayer typing battles, practice coding exercises, and level up your skills.`,
  icons: {
    icon: '/icon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProvider>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg,#0B0B0B)] text-[var(--text,#f8fafc)]">
              <div className="w-16 h-16 border-4 border-[var(--accent,#FF6B00)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            {children}
          </Suspense>
        </AppProvider>
      </body>
    </html>
  );
}
