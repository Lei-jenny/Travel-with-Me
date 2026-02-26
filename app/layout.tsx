import type {Metadata} from 'next';
import {Space_Grotesk, Rajdhani, Orbitron, Cinzel, JetBrains_Mono} from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Travel With Me - Rhine Lab Terminal',
  description: 'Secure Travel Protocol // Columbian Pioneer Association',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${rajdhani.variable} ${orbitron.variable} ${cinzel.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
      </head>
      <body suppressHydrationWarning className="bg-[#0B1026] text-slate-100 font-sans antialiased overflow-x-hidden min-h-screen selection:bg-[#Cfb568] selection:text-[#0B1026]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
