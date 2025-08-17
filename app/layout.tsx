import type { Metadata, Viewport } from "next";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Geist_Mono, IBM_Plex_Sans} from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/ThemeProvider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Voice Generator",
  description: "Generate realistic AI voices with ease.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode;}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.variable} antialiased ${ibmPlexSans.className}`}>
        <SessionProvider>
          <ReactQueryProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                <Toaster position="bottom-right" reverseOrder={false}/>
                {children}
            </ThemeProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
