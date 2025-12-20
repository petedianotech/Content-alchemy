'use server';
/**
 * @fileOverview A flow to handle the Facebook Page connection process.
 *
 * - connectFacebookPage - Generates the authentication URL for Facebook.
 * - ConnectFacebookPageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ConnectFacebookPageOutputSchema = z.object({
  authUrl: z.string().describe('The URL to redirect the user to for Facebook authentication.'),
});
export type ConnectFacebookPageOutput = z.infer<typeof ConnectFacebookPageOutputSchema>;

// This is the function that will be called from the client-side.
export async function connectFacebookPage(): Promise<ConnectFacebookPageOutput> {
  return connectFacebookPageFlow();
}

const connectFacebookPageFlow = ai.defineFlow(
  {
    name: 'connectFacebookPageFlow',
    outputSchema: ConnectFacebookPageOutputSchema,
  },
  async () => {
    const appId = process.env.FACEBOOK_APP_ID;
    if (!appId) {
      throw new Error('FACEBOOK_APP_ID environment variable is not set.');
    }

    // Use the site URL from environment variables for a reliable redirect URI.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        throw new Error('NEXT_PUBLIC_SITE_URL environment variable is not set. Please set it to your application\'s public URL.');
    }
    const redirectUri = `${siteUrl}/api/auth/facebook/callback`;


    // The permissions your app is requesting.
    const scope = 'pages_manage_posts,pages_read_engagement';

    // Construct the Facebook login URL.
    const authUrl = new URL('https://www.facebook.com/v20.0/dialog/oauth');
    authUrl.searchParams.set('client_id', appId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', 'some_random_state_string_for_security'); // CSRF protection

    return {
      authUrl: authUrl.toString(),
    };
  }
);
