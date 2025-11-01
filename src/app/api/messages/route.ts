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

    const { chatId, text } = await request.json();

    const message = await prisma.message.create({
      data: {
        text,
        userId: user.id,
        chatId,
        status: 'sent',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        readBy: {
          select: {
            userId: true,
          },
        },
      },
    });

    // Update chat updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      message: {
        id: message.id,
        text: message.text,
        userId: message.userId,
        username: message.user.username,
        timestamp: message.timestamp,
        status: message.status,
        readBy: message.readBy.map(r => r.userId),
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
