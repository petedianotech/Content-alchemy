import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return new NextResponse('FACEBOOK_APP_ID environment variable is not set.', { status: 500 });
  }

  const { protocol, host } = new URL(request.url);
  const siteUrl = `${protocol}//${host}`;
  const redirectUri = `${siteUrl}/api/auth/facebook/callback`;
  
  const scope = 'pages_show_list,pages_manage_posts,pages_read_engagement';

  // Generate a random state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');
  
  // Store the state in a secure, HTTP-only cookie
  cookies().set('facebook_oauth_state', state, {
    path: '/',
    maxAge: 60 * 10, // 10 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  const authUrl = new URL('https://www.facebook.com/v20.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
