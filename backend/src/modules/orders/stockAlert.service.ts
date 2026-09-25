import { prisma } from "../../lib/prisma";
import { sendMail } from "../../lib/mailer";

const DEFAULT_THRESHOLD = 5;
const ALERT_COOLDOWN_HOURS = 24; 

export async function checkLowStockAndNotify(productId: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const threshold = product.lowStockThreshold ?? (await getGlobalThreshold());

  if (product.stock > threshold) return;

  const cooldownDate = new Date(Date.now() - ALERT_COOLDOWN_HOURS * 60 * 60 * 1000);
  const recentAlert = await prisma.stockAlertLog.findFirst({
    where: { productId, sentAt: { gte: cooldownDate } },
  });

  if (recentAlert) return;

  const admins = await prisma.user.findMany({
    where: { role: { name: "ADMIN" }, isBlocked: false },
    select: { email: true },
  });

  const html = `
    <h2>Alerta de stock bajo</h2>
    <p>El producto "<strong>${product.name}</strong>" (ID ${product.id}) tiene un stock de ${product.stock} unidades, por debajo del umbral configurado.</p>
  `;

  await prisma.stockAlertLog.create({ data: { productId } });
}

async function getGlobalThreshold(): Promise<number> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "LOW_STOCK_THRESHOLD" },
  });
  return setting ? Number(setting.value) : DEFAULT_THRESHOLD;
}