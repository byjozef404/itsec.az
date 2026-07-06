import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen w-full">
    <Header />
    <main className="flex-1 min-w-0">{children}</main>
    <Footer />
  </div>
);
