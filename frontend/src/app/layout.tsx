import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: "Meme'd — Campaign Payout Tracker",
  description: "Creator marketplace payout tracker with milestone ladders and budget enforcement",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            <p>Meme'd Marketplace &bull; Campaign Milestone &amp; Payout Tracker &bull; Built for WLDD</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
