import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma/client.ts';

const adapter = new PrismaPg({ 
  connectionString: 'postgresql://neondb_owner:npg_5pUN8XnuQjwK@ep-long-waterfall-am857g52.c-5.us-east-1.aws.neon.tech/pos-system?sslmode=require&channel_binding=require'
});
const prisma = new PrismaClient({ adapter });

try {
  const products = await prisma.product.findMany();
  console.log('Products count:', products.length);
  const users = await prisma.user.findMany({ select: { id: true, username: true, role: true } });
  console.log('Users:', JSON.stringify(users));
} catch (e) {
  console.error('Error:', e.message);
  console.error('Code:', e.code);
} finally {
  await prisma.$disconnect();
}
