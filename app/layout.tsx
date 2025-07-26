import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { metadata, viewport } from "./metadata";
import { WebVitals } from "@/components/WebVitals";
import { SessionProvider } from "next-auth/react";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { SidebarProvider } from "@/components/ui/sidebar";

import ClientWrapper from "@/components/ClientWrapper";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export { metadata, viewport };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WebVitals />
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange> */}
        <SessionProvider>
          <RealtimeProvider>
            <SidebarProvider>
              
              <main className=" w-full">
                <ClientWrapper>
                  <div className="">
                    {children}
                  </div>
                </ClientWrapper>
              </main>
              <Toaster position="top-center" />
            </SidebarProvider>
          </RealtimeProvider>
        </SessionProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
