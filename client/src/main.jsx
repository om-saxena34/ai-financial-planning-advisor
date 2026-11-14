import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#1e1b4b',
          color: '#e0e7ff',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#6366f1', secondary: '#e0e7ff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fef2f2' },
        },
      }}
    />
  </BrowserRouter>
);
