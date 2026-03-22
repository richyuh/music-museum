import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Music Museum",
    template: "%s | Music Museum",
  },
  description: "A virtual museum of album art — explore genres, discover classics, and curate your collection.",
  keywords: ["music", "albums", "album art", "genres", "music discovery", "vinyl", "collection"],
  authors: [{ name: "Music Museum" }],
  openGraph: {
    type: "website",
    siteName: "Music Museum",
    title: "Music Museum",
    description: "A virtual museum of album art — explore genres, discover classics, and curate your collection.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Music Museum",
    description: "A virtual museum of album art — explore genres, discover classics, and curate your collection.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <SessionProvider>
            <QueryProvider>{children}</QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
