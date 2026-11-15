import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuickReplyChips from '../components/Chatbot/QuickReplyChips';
import ChatCards from '../components/Chatbot/ChatCards';
import ChatMessage from '../components/Chatbot/ChatMessage';

describe('Chatbot Frontend Components', () => {
  it('renders QuickReplyChips and fires onSelect', () => {
    const handleSelect = vi.fn();
    const testChips = ['What is SIP?', 'Check Health Score'];

    render(<QuickReplyChips chips={testChips} onSelect={handleSelect} />);

    expect(screen.getByText('What is SIP?')).toBeInTheDocument();
    expect(screen.getByText('Check Health Score')).toBeInTheDocument();

    fireEvent.click(screen.getByText('What is SIP?'));
    expect(handleSelect).toHaveBeenCalledWith('What is SIP?');
  });

  it('renders ChatCards for SIP calculation accurately', () => {
    const sipCard = {
      type: 'sip_calculation',
      data: {
        monthlyAmount: 5000,
        annualRate: 12,
        years: 10,
        totalInvested: 600000,
        wealthGain: 561695,
        futureValue: 1161695,
      },
    };

    render(
      <MemoryRouter>
        <ChatCards card={sipCard} />
      </MemoryRouter>
    );

    expect(screen.getByText(/SIP Math Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/10 Years @ 12% p.a./i)).toBeInTheDocument();
    expect(screen.getByText(/₹11,61,695/i)).toBeInTheDocument();
  });

  it('renders ChatMessage with user and assistant roles', () => {
    const userMsg = {
      role: 'user',
      text: 'Hello Fin!',
      timestamp: new Date().toISOString(),
    };

    const botMsg = {
      role: 'assistant',
      text: 'Hi there! I am Fin, your money helper.',
      disclaimer: 'Educational purposes only',
      timestamp: new Date().toISOString(),
    };

    const { rerender } = render(
      <MemoryRouter>
        <ChatMessage message={userMsg} />
      </MemoryRouter>
    );

    expect(screen.getByText('Hello Fin!')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <ChatMessage message={botMsg} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Hi there! I am Fin/i)).toBeInTheDocument();
    expect(screen.getByText(/Educational purposes only/i)).toBeInTheDocument();
  });
});
