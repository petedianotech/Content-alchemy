'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Ensure Firebase is initialized (important for server-side code)
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const firestore = getFirestore();
const auth = getAuth();

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

    // For simplicity, we use the first page found.
    // A real app might let the user choose.
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
  const { searchParams, host } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  // Later, we'd validate the 'state' parameter against a stored value for CSRF protection.

  if (!code) {
    return new NextResponse('Authorization code not found in request.', { status: 400 });
  }

  try {
    const siteUrl = `https://${host}`;
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

    // This part assumes you have a way to get the current Firebase user's UID.
    // In a real app, this might come from a session cookie or a token.
    // For this example, we'll assume a placeholder user ID.
    // IMPORTANT: In a real app, you MUST get the logged-in user's UID securely.
    const userId = auth.currentUser?.uid; 
    if (!userId) {
        // Redirect to login or show an error if no user is logged in.
        return NextResponse.redirect(`${siteUrl}/facebook-post-generator?error=NotLoggedIn`);
    }

    // Step 4: Save the Page ID and Page Access Token to Firestore
    const settingsDocRef = doc(firestore, 'users', userId, 'facebookSettings', 'default');
    await setDoc(settingsDocRef, {
        userId: userId,
        pageId: pageId,
        accessToken: pageAccessToken,
        lastModified: serverTimestamp(),
    }, { merge: true });


    // Redirect user back to the Facebook generator page with a success message
    return NextResponse.redirect(`${siteUrl}/facebook-post-generator?success=true`);

  } catch (error: any) {
    console.error('Facebook callback error:', error);
    // Redirect with an error message
    const siteUrl = `https://${host}`;
    return NextResponse.redirect(`${siteUrl}/facebook-post-generator?error=${encodeURIComponent(error.message)}`);
  }
}
