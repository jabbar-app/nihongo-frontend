import { Inter, Urbanist } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
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

export const metadata: Metadata = {
    title: {
        default: "Manabou",
        template: "%s | Manabou",
    },
    description:
        "Manabou helps you learn Japanese with spaced repetition, a daily plan, and focused study tracking.",
    keywords: [
        "Japanese",
        "JLPT",
        "spaced repetition",
        "SRS",
        "vocabulary",
        "study tracker",
    ],
    authors: [{ name: "Manabou" }],
    creator: "Manabou",
    applicationName: "Manabou",
    appleWebApp: {
        title: "Manabou",
        capable: true,
        statusBarStyle: "default",
    },
    openGraph: {
        title: "Manabou – Learn Japanese with a daily plan",
        description:
            "Spaced repetition reviews, mnemonics, a daily plan, and focused study tracking.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Manabou – Learn Japanese with a daily plan",
        description:
            "Spaced repetition reviews, mnemonics, a daily plan, and focused study tracking.",
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
                                    if (darkMode === 'false') {
                                        document.documentElement.classList.remove('dark');
                                    } else {
                                        // Default to dark mode if no preference or 'true'
                                        document.documentElement.classList.add('dark');
                                    }
                                } catch (e) {
                                    // Default to dark mode on error
                                    document.documentElement.classList.add('dark');
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
            </body>
        </html>
    );
}
