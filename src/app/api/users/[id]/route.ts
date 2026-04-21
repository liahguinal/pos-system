import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.user.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { password, role } = await req.json();
  const data: any = {};
  if (password) data.password = await bcrypt.hash(password, 10);
  if (role) data.role = role;
  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data,
    select: { id: true, username: true, role: true, createdAt: true },
  });
  return NextResponse.json(user);
}
