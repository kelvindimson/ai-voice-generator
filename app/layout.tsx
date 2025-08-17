import type { Metadata, Viewport } from "next";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dance Flow",
  description: "A dance class management system",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode;}>) {
  return (
    <html lang="en" className="text-base">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <ReactQueryProvider>
            <Toaster position="bottom-right" reverseOrder={false}/>

            {children}
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
