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
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
        ],
        other: [
            { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
        ]
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