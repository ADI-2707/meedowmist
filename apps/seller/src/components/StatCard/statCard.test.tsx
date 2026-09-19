import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('Seller StatCard Component', () => {
  it('renders label and string value', () => {
    render(<StatCard label="Gross Revenue" value="₹24,500" />);
    expect(screen.getByText('Gross Revenue')).toBeDefined();
    expect(screen.getByText('₹24,500')).toBeDefined();
  });

  it('renders numeric value', () => {
    render(<StatCard label="Total Orders" value={42} />);
    expect(screen.getByText('Total Orders')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
  });

  it('renders subtext when provided', () => {
    render(<StatCard label="Revenue" value="₹0" subtext="Net sales to date" />);
    expect(screen.getByText('Net sales to date')).toBeDefined();
  });

  it('renders badge with text and variant', () => {
    render(
      <StatCard
        label="Pending Dispatch"
        value={5}
        badge={{ text: 'Action Needed', variant: 'warning' }}
      />
    );
    expect(screen.getByText('Action Needed')).toBeDefined();
  });

  it('applies highlight container class when highlight is true', () => {
    const { container } = render(
      <StatCard label="Featured KPI" value="100" highlight={true} />
    );
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.className).toContain('cardHighlight');
  });
});
