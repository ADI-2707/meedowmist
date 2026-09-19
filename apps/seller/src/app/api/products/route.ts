import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionUser } from '@/lib/session';
import { parsePaginationParams } from '@meadowmist/shared';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');

    const whereClause: {
      category?: string;
      name?: { contains: string };
      isActive?: boolean;
    } = {};

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.name = { contains: search };
    }

    if (status === 'ACTIVE') {
      whereClause.isActive = true;
    } else if (status === 'INACTIVE') {
      whereClause.isActive = false;
    }

    const pageParam = url.searchParams.get('page');
    const limitParam = url.searchParams.get('limit');
    const isPaginated = pageParam !== null || limitParam !== null;
    const { page, limit, skip } = parsePaginationParams(url, 20, 100);

    const [total, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        ...(isPaginated ? { skip, take: limit } : {}),
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page: isPaginated ? page : 1,
        limit: isPaginated ? limit : total,
        total,
        totalPages: isPaginated ? Math.ceil(total / limit) : 1,
      },
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      salePrice,
      category,
      subCategory,
      images,
      materials,
      dimensions,
      badge,
      colorFamily,
      scentFamily,
      scentNotes,
      customOptions,
      stockQuantity = 0,
      lowStockThreshold = 5,
      isFeatured = false,
      isActive = true,
    } = body;

    if (!name || !price || !category || !subCategory) {
      return NextResponse.json(
        { error: 'Name, price, category, and subcategory are required' },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug && slug.trim()
        ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
        : name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const existing = await prisma.product.findUnique({
      where: { slug: generatedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A product with this slug already exists. Please choose a unique slug.' },
        { status: 409 }
      );
    }

    const initialStock = Number(stockQuantity) || 0;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: String(name).trim(),
          slug: generatedSlug,
          description: description ? String(description).trim() : '',
          price: Number(price),
          salePrice: salePrice ? Number(salePrice) : null,
          category: String(category).trim().toLowerCase(),
          subCategory: String(subCategory).trim().toLowerCase(),
          images: typeof images === 'string' ? images : JSON.stringify(images || []),
          materials: typeof materials === 'string' ? materials : JSON.stringify(materials || []),
          dimensions: dimensions ? String(dimensions).trim() : null,
          badge: badge || null,
          colorFamily: colorFamily || 'ivory',
          scentFamily: scentFamily || null,
          scentNotes: typeof scentNotes === 'string' ? scentNotes : JSON.stringify(scentNotes || []),
          customOptions: typeof customOptions === 'string' ? customOptions : JSON.stringify(customOptions || {}),
          stockQuantity: initialStock,
          lowStockThreshold: Number(lowStockThreshold) || 5,
          inStock: initialStock > 0,
          isFeatured: Boolean(isFeatured),
          isActive: Boolean(isActive),
        },
      });

      if (initialStock > 0) {
        await tx.inventoryLog.create({
          data: {
            productId: created.id,
            changeQuantity: initialStock,
            newQuantity: initialStock,
            reason: 'RESTOCK',
            note: 'Initial catalog creation',
          },
        });
      }

      return created;
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Product POST error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
