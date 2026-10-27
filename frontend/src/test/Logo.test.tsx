import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Logo } from '../components/common/Logo';

describe('Logo Component', () => {
  it('renders the UrbanPulse AI product name with badge', () => {
    render(
      <BrowserRouter>
        <Logo showTagline={true} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Urban/i)).toBeDefined();
    expect(screen.getByText(/Pulse/i)).toBeDefined();
    expect(screen.getByText(/AI/i)).toBeDefined();
    expect(screen.getByText(/Smart City Operations/i)).toBeDefined();
  });
});
