import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: "seven" } });
  if (existing) {
    console.log("User 'seven' already exists.");
    return;
  }
  const hashed = await bcrypt.hash("g7rr", 10);
  await prisma.user.create({ data: { username: "seven", password: hashed, role: "admin" } });
  console.log("✓ User created: seven / g7rr");
}

main().catch(console.error).finally(() => prisma.$disconnect());
