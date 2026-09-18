import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      role: {
        not: 'ADMIN',
      },
    },
  });

  const ordersCount = await prisma.order.count();
  const customersCount = await prisma.user.count({
    where: { role: 'CUSTOMER' },
  });
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN' },
  });
  const productsCount = await prisma.product.count();

  console.log(`Clean completed. Orders: ${ordersCount}, Customers: ${customersCount}, Admin: ${adminCount}, Products: ${productsCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
