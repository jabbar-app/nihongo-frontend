import { Inter, Urbanist } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/navbar";
import LenisScroll from "@/components/lenis";
import Footer from "@/components/footer";
import BottomNav from "@/components/bottom-nav";
import { ThemeProvider } from "@/lib/theme-context";
import { HeaderProvider } from "@/components/header-context";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
});

const urbanist = Urbanist({
    variable: "--font-urbanist",
    subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://manabou.app";
const OG_IMAGE = "https://flagcdn.com/w1280/jp.png"; // Japan flag for OG/social

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
    appleWebApp: {
        title: "Manabou",
        capable: true,
        statusBarStyle: "default",
    },
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
                url: OG_IMAGE,
                width: 1280,
                height: 853,
                alt: "Japan – Learn Japanese with Manabou",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Manabou – Learn Japanese with a daily plan",
        description:
            "Spaced repetition reviews, mnemonics, a daily plan, and focused study tracking.",
        images: [OG_IMAGE],
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
                        <div className="hidden md:block">
                            <Footer />
                        </div>
                        <div className="md:hidden">
                            <BottomNav />
                        </div>
                    </HeaderProvider>
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    );
}
