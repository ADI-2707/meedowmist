import { describe, it, expect } from 'vitest';
import { parsePaginationParams, createPaginatedResponse } from './pagination';

describe('Pagination Utilities', () => {
  it('parses default pagination params when none provided', () => {
    const params = parsePaginationParams('http://localhost/api/items');
    expect(params.page).toBe(1);
    expect(params.limit).toBe(20);
    expect(params.skip).toBe(0);
  });

  it('parses valid page and limit query params', () => {
    const params = parsePaginationParams('http://localhost/api/items?page=3&limit=15');
    expect(params.page).toBe(3);
    expect(params.limit).toBe(15);
    expect(params.skip).toBe(30);
  });

  it('clamps invalid or negative values to safe bounds', () => {
    const params = parsePaginationParams('http://localhost/api/items?page=-5&limit=500');
    expect(params.page).toBe(1);
    expect(params.limit).toBe(100);
    expect(params.skip).toBe(0);
  });

  it('creates paginated response metadata accurately', () => {
    const items = ['a', 'b', 'c'];
    const result = createPaginatedResponse(items, 55, 2, 10);
    expect(result.items).toEqual(items);
    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 55,
      totalPages: 6,
      hasNext: true,
      hasPrev: true,
    });
  });

  it('handles first and last page boundaries correctly', () => {
    const firstPage = createPaginatedResponse(['a'], 20, 1, 10);
    expect(firstPage.pagination.hasPrev).toBe(false);
    expect(firstPage.pagination.hasNext).toBe(true);

    const lastPage = createPaginatedResponse(['b'], 20, 2, 10);
    expect(lastPage.pagination.hasPrev).toBe(true);
    expect(lastPage.pagination.hasNext).toBe(false);
  });

  it('handles empty datasets safely', () => {
    const empty = createPaginatedResponse([], 0, 1, 20);
    expect(empty.pagination.totalPages).toBe(1);
    expect(empty.pagination.hasNext).toBe(false);
    expect(empty.pagination.hasPrev).toBe(false);
  });
});
