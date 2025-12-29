import { NextRequest, NextResponse } from 'next/server';
import { getPaste } from '@/lib/paste';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const headers = request.headers;

    const paste = await getPaste(id, headers);

    if (!paste) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(paste, { status: 200 });
  } catch (error) {
    console.error('Error fetching paste:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

