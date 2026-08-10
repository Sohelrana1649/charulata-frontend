import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, identifier, password } = body;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const backendRes = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, identifier, password })
    });

    const backendJson = await backendRes.json();
    return NextResponse.json(backendJson, { status: backendRes.status });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { status: 'error', message: error?.message || 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}
