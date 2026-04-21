import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { items, total, payment, change } = await req.json();

  const sale = await prisma.sale.create({
    data: {
      total,
      payment,
      change,
      items: {
        create: items.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  // deduct stock
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.id },
      data: {
        stock: { decrement: item.quantity },
      },
    });
  }

  return NextResponse.json(sale);
}
