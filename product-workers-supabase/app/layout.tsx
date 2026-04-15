import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Workers App',
  description: 'Simple mobile-first app for products, workers, counters and reports.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
