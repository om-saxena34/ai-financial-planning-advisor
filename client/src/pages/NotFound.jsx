import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-5xl mb-6 shadow-inner">
          404
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          The page you are looking for doesn't exist or has been moved to a different URL.
        </p>
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4 mr-2" /> Return Home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go to Dashboard
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
