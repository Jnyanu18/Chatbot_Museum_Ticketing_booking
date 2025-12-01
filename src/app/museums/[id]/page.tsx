'use client';
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { notFound } from "next/navigation";

import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCollection, useDoc } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useMemo } from "react";
import type { Museum, Event } from "@/lib/types";

export default function MuseumDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const museumId = params.id;

  const museumRef = useMemo(() => {
    if (!firestore || !museumId) return null;
    return doc(firestore, 'museums', museumId);
  }, [firestore, museumId]);

  const eventsQuery = useMemo(() => {
    if (!firestore || !museumId) return null;
    return query(collection(firestore, 'events'), where('museumId', '==', museumId));
  }, [firestore, museumId]);
  
  const { data: museum, isLoading: isMuseumLoading } = useDoc<Museum>(museumRef);
  const { data: museumEvents, isLoading: areEventsLoading } = useCollection<Event>(eventsQuery);
  
  if (!isMuseumLoading && !museum) {
    notFound();
  }

  const googleMapsUrl = museum ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${museum.location.address}, ${museum.location.city}, ${museum.location.country}`
  )}` : '';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/museums">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Museums
            </Link>
          </Button>

          { isMuseumLoading ? <p>Loading museum...</p> : museum && (
             <>
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg md:h-96">
                      {museum.imageUrl ? (
                        <Image
                          src={museum.imageUrl}
                          alt={museum.name}
                          fill
                          className="object-cover"
                          data-ai-hint={museum.imageHint}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <Building2 className="h-24 w-24 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <h1 className="mb-2 font-headline text-4xl font-bold md:text-5xl">{museum.name}</h1>
                    <div className="mb-4 flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span>{museum.location.city}, {museum.location.country}</span>
                    </div>
                    <p className="text-lg leading-relaxed">{museum.description}</p>
                  </div>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Opening Hours</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {museum.openHours.map((hours, index) => (
                            <li key={index} className="flex justify-between">
                              <span>{hours.day}</span>
                              <span className="font-medium">{hours.open} - {hours.close}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Location</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{museum.location.address},</p>
                        <p>{museum.location.city}, {museum.location.country}</p>
                        <Button asChild variant="outline" className="w-full mt-4">
                          <Link href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                              Get Directions
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              
                <Separator className="my-12"/>

                <div>
                    <h2 className="mb-8 font-headline text-3xl font-bold text-center">Upcoming Events</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {areEventsLoading ? <p>Loading events...</p> : museumEvents && museumEvents.length > 0 ? museumEvents.map(event => (
                              <Card key={event.id} className="flex flex-col overflow-hidden">
                                <CardHeader className="p-0">
                                  <div className="aspect-video w-full overflow-hidden">
                                      {event.imageUrl ? (
                                      <Image
                                          src={event.imageUrl}
                                          alt={event.title}
                                          width={400}
                                          height={200}
                                          className="w-full object-cover"
                                          data-ai-hint={event.imageHint}
                                      />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-muted">
                                          <Ticket className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                      )}
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow">
                                      <CardTitle className="font-headline text-xl">{event.title}</CardTitle>
                                      <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                                          <div className="flex items-center gap-2">
                                              <Calendar className="h-4 w-4"/>
                                              <span>{event.date}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              <Clock className="h-4 w-4"/>
                                              <span>{event.startTime} - {event.endTime}</span>
                                          </div>
                                      </div>
                                      <p className="mt-2 text-sm">{event.description}</p>
                                </CardContent>
                                <CardContent className="p-4 pt-0 flex justify-between items-center">
                                      <span className="text-lg font-bold">${event.basePrice}</span>
                                      <Button asChild>
                                        <Link href={`/dashboard/new-booking?museumId=${event.museumId}&eventId=${event.id}`}>Book Tickets</Link>
                                      </Button>
                                </CardContent>
                              </Card>
                            )) : (
                                <p className="md:col-span-3 text-center text-muted-foreground">No upcoming events at this museum.</p>
                            )}
                    </div>
                </div>
             </>
          )}
        </div>
      </main>
    </div>
  );
}
