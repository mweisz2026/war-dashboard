import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'War Impact Tracker — Iran · Israel · US',
  description: 'Real-time market and macro impact dashboard tracking the Iran/Israel/US conflict: energy, equities, rates, credit, FX, freight, and live news.',
  openGraph: {
    title: 'War Impact Tracker',
    description: 'Live market dashboard for Iran/Israel/US conflict impact on global markets.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-mono antialiased bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
