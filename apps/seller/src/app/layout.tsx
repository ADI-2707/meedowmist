import type { Metadata } from 'next';
import './globals.css';
import { ShellLayout } from '@/components/ShellLayout/ShellLayout';

export const metadata: Metadata = {
  title: 'Meadow Mist — Seller Portal',
  description: 'Dedicated administrative seller portal for Meadow Mist',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}
