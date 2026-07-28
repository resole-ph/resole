import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from "@/components/Footer";
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
      {/* Added "flex flex-col" to keep the page structured for a sticky footer layout */}
      <body className="flex flex-col min-h-screen bg-background text-on-surface">
        <AuthProvider>
          <AuthGateProvider>
            <Navbar />
            
            {/* Added "flex-grow" to push the footer down if content is short */}
            <main className="flex-grow pt-[72px]">{children}</main>
            
            {/* Rendered the global footer inside the auth context flow */}
            <Footer />
          </AuthGateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}