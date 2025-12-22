
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Frown, Twitter, BarChart2, MessageCircle, Repeat, Heart, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Tweet {
    id: string;
    content: string;
    generationParams: {
        niche: string;
        topic?: string;
        style?: string;
        tone?: string;
        viral?: boolean;
    };
    metrics: {
        impressions: number;
        likes: number;
        retweets: number;
        replies: number;
    };
    creationDate: {
        seconds: number;
        nanoseconds: number;
    } | null;
}

const MetricDisplay = ({ icon: Icon, value, label }: { icon: React.ElementType, value: number, label: string }) => (
    <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{value}</span>
        <span className="sr-only">{label}</span>
    </div>
);

export default function TweetAnalyticsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const tweetsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'tweets'),
            orderBy('creationDate', 'desc')
        );
    }, [user, firestore]);

    const { data: tweets, isLoading, error } = useCollection<Tweet>(tweetsQuery);

    if (isUserLoading || (user && isLoading)) {
        return (
            <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your tweet analytics...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
                 <Frown className="h-16 w-16 text-destructive" />
                <h1 className="text-3xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You need to be logged in to view analytics.</p>
                <Link href="/tweet-generator" passHref>
                    <Button>
                        Go to Tweet Generator
                    </Button>
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
                 <Frown className="h-16 w-16 text-destructive" />
                <h1 className="text-3xl font-bold">Error Fetching Tweets</h1>
                <p className="text-muted-foreground max-w-md">{error.message}</p>
                 <Link href="/" passHref>
                    <Button>
                        Return to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div>
             <div className="mb-6 flex items-center justify-between">
                <h1 className="font-headline text-4xl font-bold text-primary flex items-center gap-3">
                    <BarChart2 />
                    Tweet Analytics
                </h1>
                 <Button>Refresh Metrics</Button>
            </div>

            {tweets && tweets.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tweets.map(tweet => (
                        <Card key={tweet.id} className="transition-shadow hover:shadow-lg flex flex-col">
                            <CardContent className='pt-6 flex-grow'>
                                <p className="whitespace-pre-wrap text-foreground">
                                    {tweet.content}
                                </p>
                            </CardContent>
                             <CardFooter className='flex flex-col items-start gap-4'>
                                <div className="flex w-full justify-between items-center text-xs text-muted-foreground">
                                    <span>
                                     {tweet.creationDate ? format(new Date(tweet.creationDate.seconds * 1000), 'PPP p') : 'Date not available'}
                                    </span>
                                     <a
                                        href={`https://twitter.com/anyuser/status/${tweet.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline"
                                    >
                                        View on X
                                    </a>
                                </div>
                                <div className='w-full h-px bg-border' />
                                <div className="w-full flex justify-between items-center">
                                    <MetricDisplay icon={Eye} value={tweet.metrics.impressions} label="Impressions" />
                                    <MetricDisplay icon={Heart} value={tweet.metrics.likes} label="Likes" />
                                    <MetricDisplay icon={Repeat} value={tweet.metrics.retweets} label="Retweets" />
                                    <MetricDisplay icon={MessageCircle} value={tweet.metrics.replies} label="Replies" />
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex h-[calc(100vh-15rem)] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                    <Twitter className="h-12 w-12 text-muted-foreground/50" />
                    <h2 className="mt-4 text-xl font-semibold">No Tweets Found</h2>
                    <p className="mt-2 text-muted-foreground">You haven&apos;t posted any tweets through the app yet.</p>
                    <Link href="/tweet-generator" passHref>
                         <Button className="mt-4">Post Your First Tweet</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
