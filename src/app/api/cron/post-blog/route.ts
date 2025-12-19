
import { NextResponse } from 'next/server';
import { scheduledBlogPostFlow } from '@/ai/flows/scheduled-blog-post-flow';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', {
      status: 401,
    });
  }

  try {
    const result = await scheduledBlogPostFlow();
    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    } else {
      return new NextResponse(result.message || 'Failed to process scheduled blog post', { status: 500 });
    }
  } catch (error: any) {
    return new NextResponse(error.message || 'An unexpected error occurred', { status: 500 });
  }
}
