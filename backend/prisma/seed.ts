import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Roles
  await prisma.role.createMany({
    data: [{ name: "ADMIN" }, { name: "CUSTOMER" }],
    skipDuplicates: true,
  });

  // Estados de pedido
  await prisma.orderStatus.createMany({
    data: [
      { name: "PENDING" },
      { name: "PAID" },
      { name: "SHIPPED" },
      { name: "DELIVERED" },
      { name: "CANCELLED" },
      { name: "PAYMENT_REJECTED" },
    ],
    skipDuplicates: true,
  });

  // Métodos de pago
  await prisma.paymentMethod.createMany({
    data: [{ name: "CREDIT_CARD" }, { name: "PAYPAL" }, { name: "CASH" }],
    skipDuplicates: true,
  });

  // Estados de pago
  await prisma.paymentStatus.createMany({
    data: [{ name: "PENDING" }, { name: "APPROVED" }, { name: "REJECTED" }],
    skipDuplicates: true,
  });

  // Umbral global de stock bajo
  await prisma.systemSetting.upsert({
    where: { key: "LOW_STOCK_THRESHOLD" },
    update: {},
    create: { key: "LOW_STOCK_THRESHOLD", value: "5" },
  });

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });