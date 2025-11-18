import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MUSEUMS } from '@/lib/data';
import Header from '@/components/layout/header';
import ChatbotWidget from '@/components/chatbot-widget';

export default function Home() {
  const featuredMuseums = MUSEUMS.slice(0, 3);
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh]">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt="Hero background image of a museum"
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
          <div className="relative container mx-auto flex h-full flex-col items-center justify-center text-center text-white">
            <h1 className="font-headline text-4xl font-bold md:text-7xl">
              Discover, Explore, Experience
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90 md:text-xl">
              Your journey through art, history, and culture begins here. Book tickets seamlessly with our AI assistant.
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/museums">
                  Explore Museums <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="featured-museums" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Featured Museums</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Explore our curated selection of world-class museums and cultural institutions.
                </p>
              </div>
            </div>
            <div className="mx-auto grid grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
              {featuredMuseums.map((museum) => {
                const museumImage = PlaceHolderImages.find(p => p.id === museum.id);
                return (
                  <Card key={museum.id} className="overflow-hidden transition-all hover:shadow-lg">
                    <CardHeader className="p-0">
                      <Link href={`/museums/${museum.id}`}>
                        <div className="aspect-video w-full overflow-hidden">
                          {museumImage ? (
                             <Image
                               src={museumImage.imageUrl}
                               alt={museum.name}
                               width={600}
                               height={400}
                               className="w-full object-cover transition-transform hover:scale-105"
                               data-ai-hint={museumImage.imageHint}
                              />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Building2 className="w-16 h-16 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </Link>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="font-headline text-2xl">{museum.name}</CardTitle>
                      <CardDescription className="mt-2">{museum.location.city}, {museum.location.country}</CardDescription>
                    </CardContent>
                    <CardFooter>
                       <Button asChild className="w-full">
                         <Link href={`/museums/${museum.id}`}>View Events</Link>
                       </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
             <div className="text-center">
                <Button asChild variant="outline">
                    <Link href="/museums">View All Museums</Link>
                </Button>
             </div>
          </div>
        </section>
      </main>
      <ChatbotWidget />
    </div>
  );
}
