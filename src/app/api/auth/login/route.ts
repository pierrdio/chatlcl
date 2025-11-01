import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/auth';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key'
);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const user = await verifyUser(username, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await new SignJWT({ userId: user.id, username: user.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({ user });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
    });

    // Check for database connection errors
    if (error.code === 'P1001') {
      return NextResponse.json(
        { error: 'Не удалось подключиться к базе данных. Проверьте что PostgreSQL запущен.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Внутренняя ошибка сервера: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
