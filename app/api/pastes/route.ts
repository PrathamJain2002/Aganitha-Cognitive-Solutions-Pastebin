import { NextRequest, NextResponse } from 'next/server';
import { createPasteSchema } from '@/lib/validation';
import { createPaste } from '@/lib/paste';
import type { CreatePasteResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = createPasteSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { content, ttl_seconds, max_views } = validationResult.data;

    // Create the paste
    const id = await createPaste(content, ttl_seconds, max_views);

    // Get the base URL
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 
                     (request.headers.get('x-forwarded-ssl') === 'on' ? 'https' : 'http');
    // Use environment variable or host header (no hardcoded localhost)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || host;
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Unable to determine base URL' },
        { status: 500 }
      );
    }
    const url = `${protocol}://${baseUrl}/p/${id}`;

    const response: CreatePasteResponse = {
      id,
      url,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating paste:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

