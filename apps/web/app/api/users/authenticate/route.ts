import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  return NextResponse.json({ body });
}
