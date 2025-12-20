import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return new NextResponse('FACEBOOK_APP_ID environment variable is not set.', { status: 500 });
  }

  // This must exactly match the URL in your Facebook App settings.
  const redirectUri = 'https://peteai.vercel.app/api/auth/facebook/callback';
  
  const scope = 'pages_manage_posts,pages_read_engagement';

  const authUrl = new URL('https://www.facebook.com/v20.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('response_type', 'code');
  // It's good practice to generate a unique, secure state for CSRF protection.
  authUrl.searchParams.set('state', 'a_random_state_string_for_security');

  return NextResponse.redirect(authUrl.toString());
}
