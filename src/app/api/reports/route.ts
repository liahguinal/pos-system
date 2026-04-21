import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalTransactions = sales.length;

  return NextResponse.json({ sales, totalRevenue, totalTransactions, date });
}
