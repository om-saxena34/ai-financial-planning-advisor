import React from 'react';
import Navbar from './Navbar';

export default function PageWrapper({ children, title, subtitle, actions }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(title || actions) && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>}
              {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center space-x-3">{actions}</div>}
          </div>
        )}
        {children}
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium text-amber-600 dark:text-amber-400">
            ⚠️ Disclaimer: FinWise is an educational project built for academic evaluation (Invertis University). It does not provide certified financial advice.
          </p>
          <p>© {new Date().getFullYear()} FinWise — AI-Powered Personal Financial Planning Advisor</p>
        </div>
      </footer>
    </div>
  );
}
