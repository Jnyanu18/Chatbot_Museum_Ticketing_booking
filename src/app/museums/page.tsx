'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Museum } from '@/lib/types';
import { useMemo } from 'react';

export default function MuseumsPage() {
  const firestore = useFirestore();
  const museumsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'museums'));
  }, [firestore]);

  const { data: museums, isLoading } = useCollection<Museum>(museumsQuery);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-6xl">
              Explore Our Museums
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Find your next cultural adventure.
            </p>
          </div>
          <div className="mb-8 max-w-md mx-auto">
             <Input type="search" placeholder="Search for museums..." className="w-full" />
          </div>

          <div className="mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? <p>Loading museums...</p> : museums?.map((museum) => (
                <Card key={museum.id} className="overflow-hidden transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="p-0">
                    <Link href={`/museums/${museum.id}`}>
                      <div className="aspect-video w-full overflow-hidden">
                        {museum.imageUrl ? (
                          <Image
                             src={museum.imageUrl}
                             alt={museum.name}
                             width={600}
                             height={400}
                             className="w-full object-cover transition-transform hover:scale-105"
                             data-ai-hint={museum.imageHint}
                           />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Building2 className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-6 flex-grow">
                    <CardTitle className="font-headline text-xl">{museum.name}</CardTitle>
                    <CardDescription className="mt-2">{museum.location.city}, {museum.location.country}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/museums/${museum.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
