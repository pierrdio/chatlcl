import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key'
);

async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.userId as string, username: payload.username as string };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId } = await request.json();

    // Get all messages in chat that user hasn't read
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        userId: { not: user.id },
        readBy: {
          none: {
            userId: user.id,
          },
        },
      },
    });

    // Mark all as read
    await Promise.all(
      messages.map(message =>
        prisma.readMessage.create({
          data: {
            messageId: message.id,
            userId: user.id,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
