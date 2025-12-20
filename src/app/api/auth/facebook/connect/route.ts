
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    throw new Error('FACEBOOK_APP_ID environment variable is not set.');
  }

  // The base URL of your application.
  // In production, this would be your actual domain.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  
  // The URI to redirect to after the user grants/denies permission.
  // This MUST be one of the URIs you configured in your Facebook App's settings.
  const redirectUri = `${baseUrl}/api/auth/facebook/callback`;

  // The permissions your app is requesting.
  // 'pages_manage_posts' is required to publish content to a page.
  const scope = 'pages_manage_posts';

  // Construct the Facebook login URL.
  const authUrl = new URL('https://www.facebook.com/v20.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('response_type', 'code');
  
  // Redirect the user to the Facebook consent screen.
  return NextResponse.redirect(authUrl.toString());
}
