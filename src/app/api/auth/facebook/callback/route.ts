'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initAdmin } from '@/firebase/server-init';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';

async function getLongLivedUserToken(shortLivedToken: string): Promise<string> {
    const url = new URL('https://graph.facebook.com/v20.0/oauth/access_token');
    url.searchParams.set('grant_type', 'fb_exchange_token');
    url.searchParams.set('client_id', process.env.FACEBOOK_APP_ID!);
    url.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET!);
    url.searchParams.set('fb_exchange_token', shortLivedToken);

    const response = await fetch(url.toString());
    const data = await response.json();
    if (data.error) {
        throw new Error(`Failed to get long-lived user token: ${data.error.message}`);
    }
    return data.access_token;
}

async function getPageAccessToken(longLivedUserToken: string): Promise<{ pageId: string, pageAccessToken: string }> {
    const url = new URL('https://graph.facebook.com/me/accounts');
    url.searchParams.set('access_token', longLivedUserToken);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error) {
        throw new Error(`Failed to get pages: ${data.error.message}`);
    }

    const firstPage = data.data?.[0];
    if (!firstPage) {
        throw new Error('No Facebook pages found for this user.');
    }
    
    return {
        pageId: firstPage.id,
        pageAccessToken: firstPage.access_token,
    };
}

export async function GET(request: NextRequest) {
  const { searchParams, host, protocol } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const siteUrl = `${protocol}//${host}`;

  // Validate state for CSRF protection
  const storedState = cookies().get('facebook_oauth_state')?.value;
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${siteUrl}/facebook-post-generator?error=${encodeURIComponent("Invalid state. CSRF detected.")}`);
  }

  // Clear the state cookie
  cookies().delete('facebook_oauth_state');
  
  if (!code) {
    return new NextResponse('Authorization code not found in request.', { status: 400 });
  }

  try {
    const { app, firestore } = initAdmin();

    const redirectUri = `${siteUrl}/api/auth/facebook/callback`;

    // Step 1: Exchange code for a short-lived user access token
    const tokenUrl = new URL('https://graph.facebook.com/v20.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', process.env.FACEBOOK_APP_ID!);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET!);
    tokenUrl.searchParams.set('code', code);
    
    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
        throw new Error(`Token exchange failed: ${tokenData.error.message}`);
    }
    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange for a long-lived user token
    const longLivedUserToken = await getLongLivedUserToken(shortLivedToken);

    // Step 3: Get a never-expiring Page Access Token
    const { pageId, pageAccessToken } = await getPageAccessToken(longLivedUserToken);

    // Step 4: Securely get the user's UID from the session cookie
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) {
        return NextResponse.redirect(`${siteUrl}/facebook-post-generator?error=NotLoggedIn`);
    }

    const decodedToken = await getAuth(app).verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;
    
    if (!userId) {
        return NextResponse.redirect(`${siteUrl}/facebook-post-generator?error=UserNotInSession`);
    }

    // Step 5: Save the Page ID and Page Access Token to Firestore
    const settingsDocRef = doc(firestore, 'users', userId, 'facebookSettings', 'default');
    await setDoc(settingsDocRef, {
        userId: userId,
        pageId: pageId,
        accessToken: pageAccessToken,
        lastModified: serverTimestamp(),
    }, { merge: true });

    return NextResponse.redirect(`${siteUrl}/facebook-post-generator?success=true`);

  } catch (error: any) {
    console.error('Facebook callback error:', error);
    return NextResponse.redirect(`${siteUrl}/facebook-post-generator?error=${encodeURIComponent(error.message)}`);
  }
}
