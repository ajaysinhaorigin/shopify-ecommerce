"use client"
import Head from 'next/head';
import Header from './Header';

export default function Layout({ children, title = 'ShopApp - Your Online Store' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Browse the latest products and collections at ShopApp" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-24 md:pt-28">
          {children}
        </main>
      </div>
    </>
  );
}
