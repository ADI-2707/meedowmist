import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('admin') === 'true';
    await clearSessionCookie(isAdmin);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    );
  }
}
