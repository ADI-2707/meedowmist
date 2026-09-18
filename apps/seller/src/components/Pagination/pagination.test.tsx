import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination Component', () => {
  it('renders item range and total count correctly', () => {
    render(
      <Pagination
        page={2}
        totalPages={5}
        totalItems={100}
        limit={20}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Showing 21-40 of 100')).toBeDefined();
  });

  it('renders disabled Prev button on first page and active Next button', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalPages={4}
        totalItems={80}
        limit={20}
        onPageChange={onPageChange}
      />
    );

    const prevButton = screen.getByRole('button', { name: /previous page/i }) as HTMLButtonElement;
    const nextButton = screen.getByRole('button', { name: /next page/i }) as HTMLButtonElement;

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);

    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders disabled Next button on last page and triggers Prev button', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={4}
        totalPages={4}
        totalItems={80}
        limit={20}
        onPageChange={onPageChange}
      />
    );

    const prevButton = screen.getByRole('button', { name: /previous page/i }) as HTMLButtonElement;
    const nextButton = screen.getByRole('button', { name: /next page/i }) as HTMLButtonElement;

    expect(nextButton.disabled).toBe(true);
    expect(prevButton.disabled).toBe(false);

    fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('triggers onPageChange when clicking specific page pill', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalPages={5}
        totalItems={100}
        limit={20}
        onPageChange={onPageChange}
      />
    );

    const page3Button = screen.getByRole('button', { name: 'Page 3' });
    fireEvent.click(page3Button);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('renders limit selector and triggers onLimitChange', () => {
    const onLimitChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalPages={5}
        totalItems={100}
        limit={20}
        onPageChange={vi.fn()}
        onLimitChange={onLimitChange}
        pageSizeOptions={[10, 20, 50]}
      />
    );

    const select = screen.getByRole('combobox', { name: /items per page/i });
    expect(select).toBeDefined();

    fireEvent.change(select, { target: { value: '50' } });
    expect(onLimitChange).toHaveBeenCalledWith(50);
  });

  it('returns null when totalItems is 0 and totalPages <= 1', () => {
    const { container } = render(
      <Pagination
        page={1}
        totalPages={1}
        totalItems={0}
        limit={20}
        onPageChange={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
