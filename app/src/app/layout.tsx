import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster"
import { AppWrapper } from '@/context/app-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Pastel Productivity',
  description: 'A productivity app with a pastel theme.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-body antialiased`}>
      <body className="bg-aurora min-h-screen">
        <AppWrapper>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </AppWrapper>
      </body>
    </html>
  );
}
