import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@meadowmist.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminMeadowMist2026!';
  const adminName = process.env.ADMIN_NAME || 'Meadow Mist Admin';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      phone: '+91 98765 43210',
      role: 'ADMIN',
      isActive: true,
    },
  });

  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Meadow Mist',
      contactEmail: 'hello@meadowmist.in',
      contactPhone: '+91 98765 43210',
      shippingFlatRate: 99,
      freeShippingThreshold: 1499,
      codEnabled: true,
      codFee: 0,
      aboutHeadline: 'Every piece starts with a feeling.',
      aboutStory:
        'Meadow Mist began as a small experiment — what if everyday objects could feel as considered as something you would frame and hang on a wall? The candles are poured in batches of eight. The ceramics are thrown, trimmed, and glazed by one pair of hands. Nothing here is the same twice.',
      aboutArtisanNote:
        'Each piece is made in small batches — the variations in texture, glaze, and finish are a feature, not a flaw. Your piece will be similar to the photographs, and deliberately not identical.',
    },
  });

  const productsFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');
  const productsRaw = fs.readFileSync(productsFilePath, 'utf-8');
  const products = JSON.parse(productsRaw);

  for (const p of products) {
    const defaultStock = p.category === 'candle' ? 20 : 12;
    const customOptions =
      p.category === 'candle'
        ? {
            fragrances: [
              'Original Scent',
              'Lavender & Wild Herbs',
              'Warm Vanilla & Sandalwood',
              'Fresh Rose & Citrus',
            ],
            waxTones: ['Natural Cream', 'Terracotta Blush', 'Amber Honey'],
            sizes: ['Standard Artisan Size', 'Petite Gift Size'],
            allowGiftMessage: true,
          }
        : {
            finishes: ['Matte Mineral Glaze', 'High Gloss Polish'],
            allowGiftMessage: true,
          };

    const productRecord = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.story,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        category: p.category,
        subCategory: p.subCategory,
        images: JSON.stringify(p.images),
        materials: JSON.stringify(p.materials),
        dimensions: p.dimensions || null,
        badge: p.badge || null,
        colorFamily: p.colorFamily,
        scentFamily: p.scentFamily || null,
        scentNotes: p.scentNotes ? JSON.stringify(p.scentNotes) : null,
        customOptions: JSON.stringify(customOptions),
        stockQuantity: defaultStock,
        lowStockThreshold: 5,
        inStock: true,
        isFeatured: p.badge === 'bestseller' || p.badge === 'new',
        isActive: true,
      },
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.story,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        category: p.category,
        subCategory: p.subCategory,
        images: JSON.stringify(p.images),
        materials: JSON.stringify(p.materials),
        dimensions: p.dimensions || null,
        badge: p.badge || null,
        colorFamily: p.colorFamily,
        scentFamily: p.scentFamily || null,
        scentNotes: p.scentNotes ? JSON.stringify(p.scentNotes) : null,
        customOptions: JSON.stringify(customOptions),
        stockQuantity: defaultStock,
        lowStockThreshold: 5,
        inStock: true,
        isFeatured: p.badge === 'bestseller' || p.badge === 'new',
        isActive: true,
      },
    });

    const existingLog = await prisma.inventoryLog.findFirst({
      where: { productId: productRecord.id },
    });

    if (!existingLog) {
      await prisma.inventoryLog.create({
        data: {
          productId: productRecord.id,
          changeQuantity: defaultStock,
          newQuantity: defaultStock,
          reason: 'RESTOCK',
          note: 'Initial batch inventory setup',
        },
      });
    }
  }

  const banners = [
    {
      title: 'Handcrafted Candles & Ceramic Décor',
      subtitle: 'Hand-poured soy candles and wheel-thrown ceramic pieces, made in small batches in India.',
      badgeText: 'New Collection 2026',
      imageUrl: '/images/products/sunflower-wax-cluster-yellow.jpg',
      linkUrl: '/candles',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'Artisan Lotus Bowls & Candle Holders',
      subtitle: 'Formed by hand with organic mineral pigments.',
      badgeText: 'Ceramics Feature',
      imageUrl: '/images/products/black-gold-lotus-tealight.jpg',
      linkUrl: '/ceramics',
      sortOrder: 2,
      isActive: true,
    },
  ];

  for (const b of banners) {
    const existingBanner = await prisma.banner.findFirst({ where: { title: b.title } });
    if (!existingBanner) {
      await prisma.banner.create({ data: b });
    }
  }

  const faqs = [
    {
      question: 'How long do Meadow Mist soy candles burn?',
      answer:
        'Our ribbed pillar candles burn for approximately 40 to 55 hours, while our smaller wax clusters burn cleanly for 18 to 25 hours. For best results, trim the cotton wick to 5mm before every burn.',
      category: 'Candle Care',
      sortOrder: 1,
      isActive: true,
    },
    {
      question: 'Are the ceramic items food safe?',
      answer:
        'Our glazed ceramic lotus bowls and tableware are glazed with lead-free, non-toxic mineral pigments. Trinket boxes and planters are crafted specifically for décor and accessories.',
      category: 'Materials',
      sortOrder: 2,
      isActive: true,
    },
    {
      question: 'What is your shipping timeline and delivery charge?',
      answer:
        'Orders are packaged with protective eco-friendly wrap and dispatched within 2 business days. Delivery across India usually takes 3-5 business days. Shipping is flat ₹99, or free on orders above ₹1,499.',
      category: 'Shipping',
      sortOrder: 3,
      isActive: true,
    },
    {
      question: 'What is your cancellation and return policy?',
      answer:
        'You can cancel any order directly from your account before it is dispatched. If your handcrafted piece arrives damaged or defective, report it within 48 hours for an instant replacement or refund.',
      category: 'Ordering',
      sortOrder: 4,
      isActive: true,
    },
  ];

  for (const f of faqs) {
    const existingFaq = await prisma.fAQ.findFirst({ where: { question: f.question } });
    if (!existingFaq) {
      await prisma.fAQ.create({ data: f });
    }
  }

  await prisma.promotion.upsert({
    where: { code: 'MEADOW10' },
    update: {},
    create: {
      code: 'MEADOW10',
      description: '10% off on your first handcrafted order',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 499,
      maxDiscount: 250,
      isActive: true,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
