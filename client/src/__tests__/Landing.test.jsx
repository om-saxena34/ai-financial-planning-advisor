import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Landing from '../pages/Landing';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

describe('Landing Page Component', () => {
  it('renders FinWise title and hero call-to-actions', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Landing />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Intelligent Financial Planning Powered by/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Machine Learning/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Start Free Advisor/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo Login/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Behavior Classification/i)).toBeInTheDocument();
  });
});
