
'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Loader2, PanelLeft, ArrowLeft, Wand2, ClipboardCopy, FileText, ShoppingCart, Image as ImageIcon, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

import { generateBookChapter } from '@/ai/flows/generate-book-chapter';
import { generateBookMarketing, type GenerateBookMarketingOutput } from '@/ai/flows/generate-book-marketing';
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

    const [generatingChapter, setGeneratingChapter] = useState<string | null>(null);
    const [marketingMaterials, setMarketingMaterials] = useState<GenerateBookMarketingOutput | null>(null);
    const [isGenerating, startGenerating] = useTransition();
    const [isGeneratingMarketing, startGeneratingMarketing] = useTransition();

    const bookDocRef = useMemoFirebase(() => {
        if (!user || !firestore || !bookId) return null;
        return doc(firestore, 'users', user.uid, 'books', bookId as string);
    }, [user, firestore, bookId]);

    const { data: book, isLoading, error } = useDoc<BookData>(bookDocRef);

    const handleGenerateChapter = (chapterTitle: string, chapterDescription: string, chapterIndex: number) => {
        if (!book) return;

        setGeneratingChapter(chapterTitle);
        startGenerating(async () => {
            try {
                // Find the content of the most recently generated chapter for context
                let previousChapterSummary: string | undefined;
                if (chapterIndex > 0) {
                     for (let i = chapterIndex - 1; i >= 0; i--) {
                        const prevChapter = book.outline[i];
                        if (prevChapter && book.chapters && book.chapters[prevChapter.title]) {
                            previousChapterSummary = book.chapters[prevChapter.title];
                            break; 
                        }
                    }
                }

                const result = await generateBookChapter({
                    title: chapterTitle,
                    description: chapterDescription,
                    genre: book.genre,
                    mood: book.mood,
                    overallPlot: book.idea,
                    previousChapterSummary: previousChapterSummary ? previousChapterSummary.substring(0, 1000) : undefined,
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
            } finally {
                setGeneratingChapter(null);
            }
        });
    };

    const handleGenerateMarketing = () => {
        if (!book) return;
        startGeneratingMarketing(async () => {
            try {
                const result = await generateBookMarketing({
                    title: book.title,
                    genre: book.genre,
                    mood: book.mood,
                    idea: book.idea,
                });
                setMarketingMaterials(result);
                 toast({
                    title: 'Marketing Kit Generated!',
                    description: `Your marketing materials are ready.`,
                });
            } catch(e) {
                console.error(e);
                toast({
                    variant: 'destructive',
                    title: 'Generation Failed',
                    description: 'Could not generate marketing materials.',
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
        // This is a non-blocking update for better UX. We can add a toast on error if needed.
        updateDoc(bookDocRef, updates).catch(err => {
            console.error("Failed to save chapter changes:", err);
            toast({ variant: 'destructive', title: "Save Error", description: "Could not save changes."})
        });
    };

    const copyToClipboard = (text: string, title: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${title} copied to clipboard!` });
    };

    const getFullBookText = () => {
        if (!book) return '';
        return book.outline
            .map(chapter => {
                const title = chapter.title;
                const content = book.chapters[title];
                // Only include chapters with content
                if (content) {
                  return `# ${title}\n\n${content}`;
                }
                return null;
            })
            .filter(Boolean) // Remove null entries
            .join('\n\n\n');
    }

    const handleDownloadPdf = () => {
        if (!book) return;
        toast({ title: "Generating PDF...", description: "This might take a moment." });

        const doc = new jsPDF();
        const fullText = getFullBookText();
        
        // Set document properties
        doc.setProperties({
            title: book.title,
        });

        // Split text into lines that fit the page width
        const splitText = doc.splitTextToSize(fullText, 180);

        // Add the text to the document, jsPDF handles pagination
        doc.text(splitText, 15, 20);
        
        // Save the PDF
        doc.save(`${book.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
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
                        <Button onClick={handleDownloadPdf}>
                           <FileDown className="mr-2"/> Download PDF
                        </Button>
                        <Button onClick={() => copyToClipboard(getFullBookText(), 'Full book content')}>
                           <ClipboardCopy className="mr-2"/> Copy All
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    {book.outline.map((chapter, index) => {
                        // Don't render an editor for structural items like "Act I"
                        if (chapter.description.toLowerCase().includes('act i') || chapter.description.toLowerCase().includes('act ii') || chapter.description.toLowerCase().includes('act iii')) return null;


                        return (
                            <div key={chapter.title}>
                                <div className="flex justify-between items-center mb-2">
                                    <h2 id={chapter.title} className="text-3xl font-headline font-bold text-primary scroll-mt-20">
                                        {chapter.title}
                                    </h2>
                                    {book.chapters && book.chapters[chapter.title] && (
                                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(book.chapters[chapter.title], chapter.title)}>
                                            <ClipboardCopy className="mr-2 h-4 w-4" />
                                            Copy Chapter
                                        </Button>
                                    )}
                                </div>
                                
                                {isGenerating && generatingChapter === chapter.title ? (
                                    <div className="w-full min-h-[300px] flex flex-col justify-center items-center bg-card rounded-md border">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                        <p className="text-muted-foreground">Generating chapter...</p>
                                    </div>
                                ) : book.chapters && book.chapters[chapter.title] ? (
                                <Textarea
                                    value={book.chapters[chapter.title]}
                                    onChange={(e) => handleContentChange(chapter.title, e.target.value)}
                                    placeholder={`Start writing content for this chapter...`}
                                    className="min-h-[300px] w-full text-lg leading-relaxed bg-card"
                                />
                                ) : (
                                    <div className="w-full min-h-[300px] flex justify-center items-center bg-card rounded-md border-2 border-dashed">
                                        <Button size="lg" onClick={() => handleGenerateChapter(chapter.title, chapter.description, index)} disabled={isGenerating}>
                                            <Wand2 className="mr-2" />
                                            Generate Chapter Content
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
                 <Card className="mt-12">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Marketing & Publishing Kit</CardTitle>
                        <CardDescription>Generate your book description, cover art prompt, and pricing.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!marketingMaterials && (
                             <Button onClick={handleGenerateMarketing} disabled={isGeneratingMarketing}>
                                {isGeneratingMarketing ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                                Generate Marketing Kit
                            </Button>
                        )}
                       
                        {marketingMaterials && (
                            <div className="space-y-6 animate-in fade-in">
                                <div>
                                    <h3 className="font-headline text-lg flex items-center gap-2 mb-2"><ImageIcon/> Book Cover Prompt</h3>
                                    <div className="p-4 bg-muted rounded-md text-sm relative">
                                        <p className="text-muted-foreground">{marketingMaterials.coverImagePrompt}</p>
                                         <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => copyToClipboard(marketingMaterials.coverImagePrompt, "Cover Prompt")}>
                                            <ClipboardCopy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                 <div>
                                    <h3 className="font-headline text-lg flex items-center gap-2 mb-2"><FileText/> Book Description</h3>
                                     <div className="p-4 bg-muted rounded-md text-sm relative">
                                        <p className="text-muted-foreground whitespace-pre-wrap">{marketingMaterials.bookDescription}</p>
                                         <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => copyToClipboard(marketingMaterials.bookDescription, "Book Description")}>
                                            <ClipboardCopy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                 <div>
                                    <h3 className="font-headline text-lg flex items-center gap-2 mb-2"><ShoppingCart/> Pricing Suggestion</h3>
                                     <div className="p-4 bg-muted rounded-md text-sm relative">
                                        <p className="text-muted-foreground whitespace-pre-wrap">{marketingMaterials.pricingSuggestion}</p>
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => copyToClipboard(marketingMaterials.pricingSuggestion, "Pricing Suggestion")}>
                                            <ClipboardCopy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

