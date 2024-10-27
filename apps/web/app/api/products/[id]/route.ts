import { type NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = context.params;
  console.log(id);

  // TODO: backend
  return NextResponse.json({});
}
