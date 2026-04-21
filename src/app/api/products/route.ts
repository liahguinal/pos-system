import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (e: any) {
    console.error("DB ERROR:", e.message, e.code);
    return NextResponse.json({ error: e.message, code: e.code }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();

  const product = await prisma.product.create({
    data: body,
  });

  return NextResponse.json(product);
}
