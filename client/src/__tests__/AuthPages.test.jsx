import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

describe('Auth Pages Render & Inputs', () => {
  it('renders Login page with email, password fields and demo buttons', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Saver Demo/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Overspender/i).length).toBeGreaterThan(0);
  });

  it('renders Register page with name, email, password strength meter', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Om Sharma/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Min 6 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Repeat your password/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue to Onboarding/i)).toBeInTheDocument();
  });
});
