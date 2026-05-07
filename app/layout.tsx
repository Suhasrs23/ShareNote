import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NavigationProgress } from "@/components/navigation-progress";
import "./globals.css";

const defaultUrl = "https://thedropzone.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "TheDropZone — Your group's shared memory",
    template: "%s | TheDropZone"
  },
  description: "A private shared space for your group to rescue links and notes from getting lost in chats.",
  keywords: ["TheDropZone", "shared links", "group memory", "collaboration", "link organizer", "private notepad"],
  authors: [{ name: "TheDropZone Team" }],
  creator: "TheDropZone",
  publisher: "TheDropZone",
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
    title: "TheDropZone — Your group's shared memory",
    description: "A private shared space for your group to rescue links and notes from getting lost in chats.",
    siteName: "TheDropZone",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "TheDropZone Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheDropZone — Your group's shared memory",
    description: "A private shared space for your group to rescue links and notes from getting lost in chats.",
    images: ["/twitter-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TheDropZone',
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
