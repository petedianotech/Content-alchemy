
'use client';

import { useMemoFirebase } from '@/firebase/provider';
import Link from 'next/link';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Library, Frown, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
    title: string;
    content: string;
    topic: string;
    creationDate: {
        seconds: number;
        nanoseconds: number;
    } | null;
}

export default function MyPostsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const postsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'blogPosts'),
            orderBy('creationDate', 'desc')
        );
    }, [user, firestore]);

    const { data: posts, isLoading, error } = useCollection<BlogPost>(postsQuery);

    if (isUserLoading || (user && isLoading)) {
        return (
            <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your posts...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
                 <Frown className="h-16 w-16 text-destructive" />
                <h1 className="text-3xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You need to be logged in to view your posts.</p>
                <Link href="/" passHref>
                    <Button>
                        Return to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
                 <Frown className="h-16 w-16 text-destructive" />
                <h1 className="text-3xl font-bold">Error Fetching Posts</h1>
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
                    <Library />
                    My Saved Posts
                </h1>
            </div>

            {posts && posts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map(post => (
                        <Card key={post.id} className="transition-shadow hover:shadow-lg flex flex-col">
                            <CardHeader>
                                <CardTitle className='line-clamp-2'>{post.title}</CardTitle>
                                <CardDescription>
                                    Generated from: &quot;{post.topic}&quot;
                                    <br />
                                    {post.creationDate ? format(new Date(post.creationDate.seconds * 1000), 'PPP') : 'Date not available'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='flex-grow'>
                                <p className="line-clamp-4 text-muted-foreground">
                                    {post.content}
                                </p>
                            </CardContent>
                            <CardFooter className='flex justify-end gap-2'>
                                <Button variant="ghost" size="icon" disabled>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" disabled>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex h-[calc(100vh-15rem)] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                    <Library className="h-12 w-12 text-muted-foreground/50" />
                    <h2 className="mt-4 text-xl font-semibold">No Posts Yet</h2>
                    <p className="mt-2 text-muted-foreground">You haven&apos;t saved any blog posts.</p>
                    <Link href="/blog-post-generator" passHref>
                         <Button className="mt-4">Generate Your First Post</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
