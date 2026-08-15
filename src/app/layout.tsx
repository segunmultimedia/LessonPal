import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

export const metadata: Metadata = {
  title: 'LessonPal — AI-Powered Teaching Companion',
  description:
    'Your AI-powered curriculum companion. Know what to teach today, where you stopped, and what comes next.',
  keywords: ['education', 'curriculum', 'teaching', 'lesson planning', 'Ghana', 'NaCCA'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
