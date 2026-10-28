import type {Metadata} from 'next';
import {Plus_Jakarta_Sans, DM_Sans, Space_Mono} from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'AdSenseGuard Studio — Standalone AI Skill Compiler & Compliance Auditor',
  description:
    'Standalone AI Skill Compiler, 2026 Google AdSense Policy Encyclopedia, and Pre-Submission Compliance Auditor for building monetization-ready websites and web apps from day one.',
  openGraph: {
    title: 'AdSenseGuard Studio — Standalone AI Skill Compiler & Compliance Auditor',
    description:
      'Standalone AI Skill Compiler, 2026 Google AdSense Policy Encyclopedia, and Pre-Submission Compliance Auditor for building monetization-ready websites and web apps from day one.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AdSenseGuard Studio — Standalone AI Skill Compiler & Compliance Auditor',
    description:
      'Standalone AI Skill Compiler, 2026 Google AdSense Policy Encyclopedia, and Pre-Submission Compliance Auditor for building monetization-ready websites and web apps from day one.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${spaceMono.variable} dark [color-scheme:dark] [scrollbar-width:thin] [scrollbar-color:#27272a_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:w-0 [&::-webkit-scrollbar-button]:h-0 [&::-webkit-scrollbar-corner]:bg-transparent`}
    >
      <body
        suppressHydrationWarning
        className="bg-black text-zinc-100 antialiased selection:bg-white/20 selection:text-white [color-scheme:dark] [scrollbar-width:thin] [scrollbar-color:#27272a_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:w-0 [&::-webkit-scrollbar-button]:h-0 [&::-webkit-scrollbar-corner]:bg-transparent [&_*]:[color-scheme:dark] [&_*]:[scrollbar-width:thin] [&_*]:[scrollbar-color:#27272a_transparent] [&_*::-webkit-scrollbar]:w-1.5 [&_*::-webkit-scrollbar]:h-1.5 [&_*::-webkit-scrollbar-track]:bg-transparent [&_*::-webkit-scrollbar-thumb]:bg-zinc-800 [&_*::-webkit-scrollbar-thumb]:rounded-full [&_*::-webkit-scrollbar-thumb:hover]:bg-zinc-700 [&_*::-webkit-scrollbar-button]:hidden [&_*::-webkit-scrollbar-button]:w-0 [&_*::-webkit-scrollbar-button]:h-0 [&_*::-webkit-scrollbar-corner]:bg-transparent"
        style={{fontFamily: 'var(--font-sans), sans-serif'}}
      >
        {children}
      </body>
    </html>
  );
}
