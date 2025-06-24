import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Image URL is required', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    
    const headers = new Headers();
    headers.set('Content-Type', 'image/png');
    headers.set('Content-Disposition', 'attachment; filename="poster.png"');

    return new NextResponse(blob, { status: 200, headers });
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Failed to download image', { status: 500 });
  }
}
