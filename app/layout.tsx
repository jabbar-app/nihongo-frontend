import { Inter, Urbanist } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "@/components/navbar";
import LenisScroll from "@/components/lenis";
import Footer from "@/components/footer";
import BottomNav from "@/components/bottom-nav";
import { ThemeProvider } from "@/lib/theme-context";
import { HeaderProvider } from "@/components/header-context";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import AppVersion from "@/components/app-version";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
});

const urbanist = Urbanist({
    variable: "--font-urbanist",
    subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://manabou.app";
const APP_ICON = `${APP_URL}/icons/icon-512x512.png`;

export const metadata: Metadata = {
    metadataBase: new URL(APP_URL),
    title: {
        default: "Manabou – Learn Japanese with a daily plan",
        template: "%s | Manabou",
    },
    description:
        "Manabou helps you learn Japanese with spaced repetition, a daily plan, mnemonics, and focused study tracking. Build a calm study habit.",
    keywords: [
        "Japanese",
        "JLPT",
        "spaced repetition",
        "SRS",
        "vocabulary",
        "study tracker",
        "learn Japanese",
        "Japanese vocabulary",
        "mnemonics",
    ],
    authors: [{ name: "Manabou", url: APP_URL }],
    creator: "Manabou",
    applicationName: "Manabou",
    referrer: "origin-when-cross-origin",
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: "/icons/icon-192x192.png",
        apple: "/icons/icon-192x192.png",
    },
    appleWebApp: {
        title: "Manabou",
        capable: true,
        statusBarStyle: "default",
    },
    manifest: "/manifest.json",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: APP_URL,
        siteName: "Manabou",
        title: "Manabou – Learn Japanese with a daily plan",
        description:
            "Spaced repetition reviews, mnemonics, a daily plan, and focused study tracking. Build a calm study habit.",
        images: [
            {
                url: APP_ICON,
                width: 512,
                height: 512,
                alt: "Manabou – Learn Japanese",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Manabou – Learn Japanese with a daily plan",
        description:
            "Spaced repetition reviews, mnemonics, a daily plan, and focused study tracking.",
        images: [APP_ICON],
    },
};
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    const darkMode = localStorage.getItem('darkMode');
                                    if (darkMode === 'true') {
                                        document.documentElement.classList.add('dark');
                                    } else {
                                        document.documentElement.classList.remove('dark');
                                    }
                                } catch (e) {
                                    document.documentElement.classList.remove('dark');
                                }
                            })();
                        `,
                    }}
                />
            </head>
            <body>
                <ThemeProvider>
                    <HeaderProvider>
                        <LenisScroll />
                        <Navbar />
                        {children}
                        <AppVersion />
                        <div className="hidden md:block">
                            <Footer />
                        </div>
                        <div className="md:hidden">
                            <BottomNav />
                        </div>
                        <PWAInstallPrompt />
                    </HeaderProvider>
                </ThemeProvider>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
