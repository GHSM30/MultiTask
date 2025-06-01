import { Geist } from 'next/font/google';
import "./globals.css";
import Providers from './providers'; // Cambiado a importación por defecto
import Head from 'next/head';

const geist = Geist({
  subsets: ['latin'],
  preload: false
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}