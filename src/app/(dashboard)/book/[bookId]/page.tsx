
'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Loader2, PanelLeft, ArrowLeft, Wand2, ClipboardCopy, FileText } from 'lucide-react';

import { generateBookChapter } from '@/ai/flows/generate-book-chapter';
import type { GenerateBookOutlineOutput } from '@/ai/flows/generate-book-outline';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

interface BookData {
    id: string;
    title: string;
    titles: string[];
    idea: string;
    genre: string;
    mood: string;
    outline: GenerateBookOutlineOutput['outline'];
    chapters: { [key: string]: string };
}

export default function BookWriterPage() {
    const { bookId } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isGenerating, startGenerating] = useTransition();

    const bookDocRef = useMemoFirebase(() => {
        if (!user || !firestore || !bookId) return null;
        return doc(firestore, 'users', user.uid, 'books', bookId as string);
    }, [user, firestore, bookId]);

    const { data: book, isLoading, error } = useDoc<BookData>(bookDocRef);

    const handleGenerateChapter = (chapterTitle: string, chapterDescription: string, chapterIndex: number) => {
        if (!book) return;

        startGenerating(async () => {
            try {
                const previousChapterSummary = chapterIndex > 0 ? book.chapters[book.outline[chapterIndex - 1].title] : undefined;

                const result = await generateBookChapter({
                    title: chapterTitle,
                    description: chapterDescription,
                    genre: book.genre,
                    mood: book.mood,
                    overallPlot: book.idea,
                    previousChapterSummary: previousChapterSummary ? previousChapterSummary.substring(0, 500) : undefined,
                });

                const newContent = `${result.chapterContent}\n\n--- IMAGE PROMPTS ---\n${result.imagePrompts.map(p => `[${p.location}]: ${p.prompt}`).join('\n')}`;

                const updates = {
                    [`chapters.${chapterTitle}`]: newContent,
                    lastModified: serverTimestamp(),
                };

                await updateDoc(bookDocRef!, updates);

                toast({
                    title: 'Chapter Generated!',
                    description: `Content for "${chapterTitle}" has been successfully created.`,
                });
            } catch (e) {
                console.error(e);
                toast({
                    variant: 'destructive',
                    title: 'Generation Failed',
                    description: 'There was an error generating the chapter content.',
                });
            }
        });
    };

    const handleContentChange = async (chapterTitle: string, newContent: string) => {
        if (!bookDocRef) return;
        const updates = {
            [`chapters.${chapterTitle}`]: newContent,
            lastModified: serverTimestamp(),
        };
        await updateDoc(bookDocRef, updates);
    };

    const copyToClipboard = () => {
        if (!book) return;
        const fullText = book.outline
            .map(chapter => {
                const title = chapter.title;
                const content = book.chapters[title] || '...';
                return `## ${title}\n\n${content}`;
            })
            .join('\n\n');

        navigator.clipboard.writeText(fullText);
        toast({ title: 'Book content copied to clipboard!' });
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (error || !book) {
        return (
            <div className="text-center">
                <p className="text-destructive">Error loading book: {error?.message}</p>
                <Button onClick={() => router.push('/book-generator')}>Go Back</Button>
            </div>
        );
    }
    
    const OutlineSidebar = () => (
        <div className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Outline</CardTitle>
                <CardDescription>Reference your chapters as you write.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
                <Accordion type="multiple" className="w-full">
                    {book.outline.map((chapter, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{chapter.title}</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground mb-4">{chapter.description}</p>
                                {!book.chapters[chapter.title] && (
                                    <Button size="sm" onClick={() => handleGenerateChapter(chapter.title, chapter.description, index)} disabled={isGenerating}>
                                        {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                                        Generate
                                    </Button>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </div>
    );

    return (
        <div className="h-[calc(100vh-8rem)] flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-1/3 lg:w-1/4 h-full border-r">
                <Card className="h-full rounded-none border-0 border-r">
                    <OutlineSidebar/>
                </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/book-generator')}>
                            <ArrowLeft />
                        </Button>
                         <Input
                            defaultValue={book.title}
                            className="text-2xl lg:text-4xl font-bold font-headline tracking-tight border-0 shadow-none focus-visible:ring-0 p-0"
                         />
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Mobile Outline Sheet */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="md:hidden">
                                    <PanelLeft className="mr-2" />
                                    Outline
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <OutlineSidebar/>
                            </SheetContent>
                        </Sheet>
                        <Button onClick={copyToClipboard}>
                           <ClipboardCopy className="mr-2"/> Copy All
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    {book.outline.map((chapter) => (
                        <div key={chapter.title}>
                            <h2 id={chapter.title} className="text-3xl font-headline font-bold text-primary mb-2 scroll-mt-20">
                                {chapter.title}
                            </h2>
                            {isGenerating && !book.chapters[chapter.title] ? (
                                <Skeleton className="h-48 w-full" />
                            ) : (
                               <Textarea
                                   value={book.chapters[chapter.title] || ''}
                                   onChange={(e) => handleContentChange(chapter.title, e.target.value)}
                                   placeholder={`Click "Generate" in the outline to create content for this chapter, or start writing yourself...`}
                                   className="min-h-[300px] w-full text-lg leading-relaxed bg-card"
                               />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


    