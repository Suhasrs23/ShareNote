import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NavigationProgress } from "@/components/navigation-progress";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "ShareNote — Your group's shared memory",
    template: "%s | ShareNote"
  },
  description: "A private shared notepad for your group. Save links, notes, and ideas — organized by topic.",
  keywords: ["shared notes", "group collaboration", "link organizer", "private notepad", "ShareNote"],
  authors: [{ name: "ShareNote Team" }],
  creator: "ShareNote",
  publisher: "ShareNote",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    title: "ShareNote — Your group's shared memory",
    description: "A private shared notepad for your group. Save links, notes, and ideas — organized by topic.",
    siteName: "ShareNote",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ShareNote Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShareNote — Your group's shared memory",
    description: "A private shared notepad for your group. Save links, notes, and ideas — organized by topic.",
    images: ["/twitter-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ShareNote',
  },
  verification: {
    google: "Ir-sQfR9IuKXNK_gJkjtnR9oUUnET0usn-qavjlteXs",
  },
};

export const viewport = {
  themeColor: '#0f172a',
};

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NavigationProgress />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
