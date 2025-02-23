import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Image from 'next/image';
import { Gantari, Roboto } from "next/font/google";

import { GoogleAnalytics } from '@next/third-parties/google';
import Head from 'next/head';
import EnvironmentBanner from "@/components/env-banner"
import { ThemeProvider } from "next-themes";
import {LoadingProvider} from "@/components/LoadingProvider";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "CourseChecker",
  description: "Find reviews on your courses.",
  icons: "/coursecheckminilogo.svg",
};

const gantari = Gantari({
  subsets: ["latin"],
  weight: ["400", "700"], // Define weights you need
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={gantari.className} suppressHydrationWarning>
      <head>
        <script src="https://accounts.google.com/gsi/client" async></script>
      </head>
      <body className="bg-background text-foreground">
      <EnvironmentBanner />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col items-center">
              <nav className="items-center py-9 w-full z-50 shadow-lg bg-md-purple flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-full flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex gap-5 items-center font-semibold">
                    <Link href="/">
                      <Image
                          src="/coursecheckminilogo.svg"
                          className=""
                          width={66}
                          height={52}
                          alt="Course Checker logo"
                      />
                    </Link>
                  </div>
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </div>
              </nav>

              <div className="flex flex-col w-full rounded-lg">
                {children}

          <GoogleAnalytics gaId="G-PW8BRX9CYT" />
              </div>
              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                <p>
                  Developed for SpartaHack X
                </p>
              </footer>
            </div>
          </main>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



