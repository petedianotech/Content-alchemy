import { config } from 'dotenv';
config();

import '@/ai/flows/provide-ai-suggestions.ts';
import '@/ai/flows/ensure-adsense-compliance.ts';
import '@/ai/flows/generate-blog-post-draft.ts';
import '@/ai/flows/generate-facebook-post.ts';
import '@/ai/flows/generate-youtube-script.ts';
import '@/ai/flows/generate-image-prompt.ts';
