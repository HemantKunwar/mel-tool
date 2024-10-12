import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  try {
    const hashedPassword = await bcrypt.hash('yourpassword', 10);
    const user = await prisma.staff.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
        password: hashedPassword,
      },
    });
    console.log('Created user:', user);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();