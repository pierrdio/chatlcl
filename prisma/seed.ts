import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default chats
  const generalChat = await prisma.chat.findFirst({
    where: { title: '# Общий' },
  });

  if (!generalChat) {
    await prisma.chat.create({
      data: { title: '# Общий' },
    });
    console.log('Created chat: # Общий');
  }

  const conferenceChat = await prisma.chat.findFirst({
    where: { title: '# Конференция' },
  });

  if (!conferenceChat) {
    await prisma.chat.create({
      data: { title: '# Конференция' },
    });
    console.log('Created chat: # Конференция');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
