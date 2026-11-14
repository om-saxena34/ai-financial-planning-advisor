import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WhatIfSimulator from '../pages/WhatIfSimulator';
import ModelMetrics from '../pages/ModelMetrics';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

describe('Advisory & Machine Learning Pages Render', () => {
  it('renders What-If Scenario Simulator with interactive decision controls', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <WhatIfSimulator />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getAllByText(/What-If Financial Simulator/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Decision Controls/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Income Boost/i)).toBeInTheDocument();
    expect(screen.getByText(/Trim Discretionary Expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/Boost Monthly SIP/i)).toBeInTheDocument();
    expect(screen.getByText(/5-Year Wealth Creation/i)).toBeInTheDocument();
  });

  it('renders Machine Learning Model Metrics evaluation artifact', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ModelMetrics />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Machine Learning Model Transparency/i)).toBeInTheDocument();
    expect(screen.getByText(/10,000 Records/i)).toBeInTheDocument();
    expect(screen.getByText(/Classifier Performance/i)).toBeInTheDocument();
    expect(screen.getByText(/Confusion Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Academic Research & Viva Evaluation Disclaimer/i)).toBeInTheDocument();
  });
});
