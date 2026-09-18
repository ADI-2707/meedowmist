export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export function parsePaginationParams(
  urlOrParams: string | URL | URLSearchParams,
  defaultLimit = 20,
  maxLimit = 100
): PaginationParams {
  let searchParams: URLSearchParams;

  if (typeof urlOrParams === 'string') {
    const url = new URL(urlOrParams, 'http://localhost');
    searchParams = url.searchParams;
  } else if (urlOrParams instanceof URL) {
    searchParams = urlOrParams.searchParams;
  } else {
    searchParams = urlOrParams;
  }

  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const rawLimit = parseInt(searchParams.get('limit') || String(defaultLimit), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const clampedLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, clampedLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const safeTotal = Math.max(0, total);
  const totalPages = limit > 0 ? Math.max(1, Math.ceil(safeTotal / limit)) : 1;
  const safePage = Math.min(Math.max(1, page), totalPages);

  return {
    items,
    pagination: {
      page: safePage,
      limit,
      total: safeTotal,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  };
}
