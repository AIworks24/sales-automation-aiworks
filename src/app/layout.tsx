import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sales Automation Platform - AI-Powered LinkedIn Outreach',
  description: 'Automate your LinkedIn prospecting with AI-powered personalization and Act! CRM integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}