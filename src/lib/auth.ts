import { prisma } from './prisma';
import bcrypt from 'bcrypt';

export async function verifyUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return null;
  }

  // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
  const isHashed = user.password.startsWith('$2a$') || 
                   user.password.startsWith('$2b$') || 
                   user.password.startsWith('$2y$');

  let isValidPassword = false;
  
  if (isHashed) {
    // Compare hashed password
    isValidPassword = await bcrypt.compare(password, user.password);
  } else {
    // Direct comparison for plain text passwords (for backwards compatibility)
    isValidPassword = user.password === password;
  }

  if (!isValidPassword) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
  };
}

export async function createUser(username: string, password: string) {
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    username: user.username,
  };
}
