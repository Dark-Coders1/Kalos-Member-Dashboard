import './globals.css';
import AppProvider from '@/components/AppProvider';

export const metadata = {
  title: 'Kalos Member Dashboard',
  description: 'Track body composition trends, upload scans, and review progress milestones.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
