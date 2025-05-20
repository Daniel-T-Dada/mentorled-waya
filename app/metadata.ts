import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    title: "Waya - Family Finance & Learning Platform",
    description: "Teach your kids financial literacy in a fun and interactive way",
    generator: "Next.js",
    manifest: "/manifest.json",
    keywords: ["finance", "kids", "family", "money", "education", "financial literacy"],
    authors: [{ name: "Waya Team" }],
    openGraph: {
        title: "Waya - Family Finance & Learning Platform",
        description: "Teach your kids financial literacy in a fun and interactive way",
        url: "https://waya-fawn.vercel.app/",
        siteName: "Waya",
        locale: "en_NG",
        type: "website",
    },
    icons: {
        apple: "/apple-touch-icon.png",
        icon: "/favicon.ico"
    },
    applicationName: "Waya",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Waya"
    },
    formatDetection: {
        telephone: false
    }
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "var(--brand)",
    colorScheme: "light dark"
}; 