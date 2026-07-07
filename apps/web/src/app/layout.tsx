import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/providers/AuthProvider';
import { AuthGateProvider } from '@/providers/AuthGateProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Resole | Premium Sneaker Marketplace',
  description: 'Buy, sell, and swap sneakers on the Philippines\' premier circular sneaker marketplace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-screen bg-background text-on-surface">
        <AuthProvider>
          <AuthGateProvider>
            <Navbar />
            <main className="pt-[72px]">{children}</main>
          </AuthGateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
