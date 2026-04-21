import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// One-time route to create the first admin. Remove after use.
export async function GET() {
  const existing = await prisma.user.findUnique({ where: { username: "seven" } });
  if (existing) return NextResponse.json({ message: "User already exists" });
  const hashed = await bcrypt.hash("g7rr", 10);
  await prisma.user.create({ data: { username: "seven", password: hashed, role: "admin" } });
  return NextResponse.json({ message: "User created. Username: seven, Password: g7rr" });
}
