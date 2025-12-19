
import { NextResponse } from 'next/server';
import { scheduledTweetFlow } from '@/ai/flows/scheduled-tweet-flow';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', {
      status: 401,
    });
  }

  try {
    const result = await scheduledTweetFlow();
    if (result.success) {
      return NextResponse.json({ success: true, tweetId: result.tweetId });
    } else {
      return new NextResponse(result.error || 'Failed to post tweet', { status: 500 });
    }
  } catch (error: any) {
    return new NextResponse(error.message || 'An unexpected error occurred', { status: 500 });
  }
}
