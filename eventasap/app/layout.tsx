// 'use client';

import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';


const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event ASAP",
  description: "An Event and service market place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} antialiased`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'white',
              color: '#333',
              border: '1px solid #e5e7eb',
            },
          }}
        />
        {children}

      </body>
    </html>
  );
}
