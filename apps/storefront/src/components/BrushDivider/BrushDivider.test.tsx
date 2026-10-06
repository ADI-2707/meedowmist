import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import BrushDivider from './BrushDivider';

describe('BrushDivider Component', () => {
  it('renders wrapper element marked as aria-hidden for accessibility', () => {
    const { container } = render(<BrushDivider />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeDefined();
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders svg divider element with valid viewBox and decorative paths', () => {
    const { container } = render(<BrushDivider />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 400 12');

    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('applies custom className when provided to props', () => {
    const { container } = render(<BrushDivider className="custom-divider-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-divider-class');
  });
});
