import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { metadata, viewport } from "./metadata";
import ClientWrapper from "@/components/ClientWrapper";
import { SidebarProvider } from "@/components/ui/sidebar";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";


import { SessionProvider } from "next-auth/react";

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
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange> */}
          <SessionProvider>
            <SidebarProvider>
              <ServiceWorkerRegistration />
              <main className=" w-full">
                <ClientWrapper>
                  <div className="">
                    {children}
                  </div>
                </ClientWrapper>
              </main>
              <Toaster />
            </SidebarProvider>
          </SessionProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
