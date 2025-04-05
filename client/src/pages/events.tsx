import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance, format } from "date-fns";
import { Event } from "@shared/schema";
import { cn } from "@/lib/utils";

interface EventWithRelevance extends Partial<Event> {
  id: number;
  name: string;
  venue: string;
  date: Date;
  relevanceScore?: number;
  personalReason?: string;
}

interface MoodCategory {
  id: string;
  name: string;
  keywords: string;
}

const EventCard: FC<{ event: EventWithRelevance }> = ({ event }) => {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const formattedDate = format(eventDate, "MMM d, yyyy • h:mm a");
  const timeUntil = isUpcoming 
    ? formatDistance(eventDate, new Date(), { addSuffix: true })
    : "Event has passed";
  
  // Calculate if the event is happening soon (within 7 days)
  const isHappeningSoon = isUpcoming && (eventDate.getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000;

  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-lg border-neutral-200 hover:border-primary/20">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={event.imageUrl || "https://via.placeholder.com/300x180?text=No+Image"} 
          alt={event.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
        
        {event.price && (
          <Badge 
            className="absolute top-3 right-3 bg-black/70 hover:bg-black/80"
          >
            {event.price}
          </Badge>
        )}
        
        {isHappeningSoon && (
          <Badge 
            className="absolute top-3 left-3 bg-red-500/90 hover:bg-red-500"
          >
            Happening Soon
          </Badge>
        )}
      </div>
      
      <CardHeader className="py-4 pb-2">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-xl font-bold line-clamp-2">{event.name}</CardTitle>
          {event.relevanceScore !== undefined && (
            <div className="flex-shrink-0">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-primary text-white font-bold shadow-sm"
                title={`${Math.round((event.relevanceScore || 0) * 100)}% match to your taste`}
              >
                {Math.round((event.relevanceScore || 0) * 100)}%
              </div>
            </div>
          )}
        </div>
        <CardDescription className="flex items-center mt-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{formattedDate}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="py-0">
        <div className="flex items-center mb-3 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-sm">{event.venue}</span>
        </div>
        
        <div className="mb-3">
          {event.genre && (
            <Badge variant="outline" className="mr-2 mb-2">
              {event.genre}
            </Badge>
          )}
        </div>
        
        <p className="text-sm line-clamp-3 mt-3 text-muted-foreground">
          {event.description || "No description available."}
        </p>
        
        {event.personalReason && (
          <div className="mt-4 p-3 rounded-md bg-primary/5 border border-primary/20">
            <p className="text-sm">
              <span className="font-semibold text-primary">Why we recommend this:</span> {event.personalReason}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 pb-4 flex justify-between items-center">
        <p className={cn(
          "text-sm font-medium",
          isHappeningSoon ? "text-red-500" : "text-muted-foreground"
        )}>
          {timeUntil}
        </p>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1"
            onClick={() => event.ticketUrl && window.open(event.ticketUrl, '_blank')}
            disabled={!event.ticketUrl}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Tickets
          </Button>
          <Button 
            size="sm"
            className="gap-1 bg-gradient-primary hover:opacity-90 text-white"
            title="Generate a Spotify playlist for this event"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            Playlist
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const EventsLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="h-full overflow-hidden border-neutral-200">
        <div className="aspect-video relative">
          <Skeleton className="w-full h-full" />
          {/* Simulated badges for layout consistency */}
          <div className="absolute top-3 right-3">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <CardHeader className="py-4 pb-2">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <Skeleton className="h-7 w-4/5 mb-2" />
              <Skeleton className="h-7 w-3/5" />
            </div>
            {/* Match score circle */}
            <div className="flex-shrink-0">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
        </CardHeader>
        <CardContent className="py-0">
          <Skeleton className="h-4 w-4/5 mb-3" />
          <div className="flex gap-2 mb-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <Skeleton className="h-16 w-full rounded-md" />
        </CardContent>
        <CardFooter className="pt-4 pb-4 flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardFooter>
      </Card>
    ))}
  </div>
);

const EventsPage: FC = () => {
  const [activeTab, setActiveTab] = useState("personalized");
  
  // Fetch all available moods
  const { data: moodsData, isLoading: moodsLoading } = useQuery<{ count: number, moods: MoodCategory[] }>({
    queryKey: ["/api/recommendations/moods"],
  });
  
  // Fetch personalized recommendations
  const { data: personalizedData, isLoading: personalizedLoading } = useQuery<{ count: number, events: EventWithRelevance[] }>({
    queryKey: ["/api/recommendations/personal"],
  });
  
  // Fetch events for the selected mood tab
  const { data: moodEventsData, isLoading: moodEventsLoading } = useQuery<{ count: number, events: EventWithRelevance[], mood: string }>({
    queryKey: [
      `/api/recommendations/mood/${activeTab}`,
    ],
    enabled: activeTab !== "personalized" && activeTab !== "all",
  });
  
  // Fetch all events
  const { data: allEventsData, isLoading: allEventsLoading } = useQuery<{ count: number, events: EventWithRelevance[] }>({
    queryKey: ["/api/events"],
    enabled: activeTab === "all",
  });
  
  // Sample events to use when API doesn't return data
  const dummyEvents: EventWithRelevance[] = [
    {
      id: 1,
      name: "Jazz Night @ The Dawson",
      venue: "The Dawson",
      description: "A night of classic jazz tunes featuring local musicians playing the best of Coltrane, Davis, and more.",
      date: new Date(),
      price: "Free Entry",
      latitude: 41.9,
      longitude: -87.6,
      personalReason: "Because you've been listening to Coltrane and Chet Baker",
      externalId: "jazz-night-1",
      genre: "Jazz",
      imageUrl: null,
      ticketUrl: null,
      source: null,
      reason: null,
      city: "Chicago",
      relevanceScore: 0.92
    },
    {
      id: 2,
      name: "Neo-Soul Brunch @ The Listening Room",
      venue: "The Listening Room",
      description: "Enjoy soulful tunes with your Sunday brunch. Live performers and DJs playing the best neo-soul and R&B.",
      date: new Date(),
      price: "$30–$50",
      latitude: 41.89,
      longitude: -87.62,
      personalReason: "Since you love Snoh Aalegra and vibey Sunday tracks",
      externalId: "neo-soul-1",
      genre: "Neo-Soul",
      imageUrl: null,
      ticketUrl: null,
      source: null,
      reason: null,
      city: "Chicago",
      relevanceScore: 0.88
    },
    {
      id: 3,
      name: "Jay Z - Brozeville Winery",
      venue: "Brozeville Winery",
      description: "Jay Z performing an intimate set at this local winery. Limited seating available.",
      date: new Date(),
      price: "Free entry",
      latitude: 41.88,
      longitude: -87.64,
      personalReason: "Your favorite rapper Jay Z just ate at this restaurant",
      externalId: "jay-z-1",
      genre: "Hip-Hop",
      imageUrl: null,
      ticketUrl: null,
      source: null,
      reason: null,
      city: "Chicago",
      relevanceScore: 0.95
    },
    {
      id: 4,
      name: "Slick Rick at the Aragon Ballroom",
      venue: "Aragon Ballroom",
      description: "Legendary Slick Rick performing his classic hits and new material for one night only.",
      date: new Date(),
      price: "$60–$120",
      latitude: 41.87,
      longitude: -87.66,
      personalReason: "Your most streamed artist in 2024 is doing a small show in Chicago",
      externalId: "slick-rick-1",
      genre: "Hip-Hop",
      imageUrl: null,
      ticketUrl: null,
      source: null,
      reason: null,
      city: "Chicago",
      relevanceScore: 0.85
    }
  ];
  
  const isLoading = 
    (activeTab === "personalized" && personalizedLoading) ||
    (activeTab === "all" && allEventsLoading) ||
    (activeTab !== "personalized" && activeTab !== "all" && moodEventsLoading);
  
  const eventsToShow = () => {
    if (activeTab === "personalized") {
      return personalizedData?.events?.length ? personalizedData.events : dummyEvents;
    }
    if (activeTab === "all") {
      return allEventsData?.events?.length ? allEventsData.events : dummyEvents;
    }
    return moodEventsData?.events?.length ? moodEventsData.events : dummyEvents;
  };
  
  return (
    <div className="p-6 pt-4 lg:ml-64">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient">
          Music Events
        </h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-3xl">
          Discover concerts and music events that match your unique taste and current mood. 
          Our recommendations are personalized based on your listening history.
        </p>
      </div>
      
      {/* Tabs */}
      <Tabs 
        defaultValue="personalized" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <div className="mb-6 border-b border-neutral-200 pb-1">
          <TabsList className="flex flex-wrap space-y-2 bg-transparent p-0">
            <div className="flex flex-wrap items-center">
              <TabsTrigger 
                value="personalized" 
                className="mr-2 mb-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                🎯 Personalized For You
              </TabsTrigger>
              
              <TabsTrigger 
                value="all" 
                className="mr-2 mb-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                🎵 All Events
              </TabsTrigger>
              
              <Separator orientation="vertical" className="mx-2 h-6" />
              
              {moodsLoading ? (
                <div className="flex items-center space-x-2 h-9 px-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ) : (
                moodsData?.moods?.map((mood) => (
                  <TabsTrigger 
                    key={mood.id} 
                    value={mood.id}
                    className="mr-2 mb-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                    title={`Keywords: ${mood.keywords}`}
                  >
                    {mood.name}
                  </TabsTrigger>
                ))
              )}
            </div>
          </TabsList>
        </div>
        
        <div>
          {isLoading ? (
            <EventsLoading />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsToShow()?.length > 0 ? (
                eventsToShow().map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-3 py-16 text-center">
                  <div className="mx-auto w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-neutral-800 mb-2">No events found</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    {activeTab === "personalized" 
                      ? "We couldn't find personalized events matching your music taste. Try switching to a different category or check back later."
                      : "No events found in this category. Try a different mood or check back later."}
                  </p>
                  <Button 
                    className="mt-6 bg-gradient-primary text-white hover:opacity-90"
                    onClick={() => setActiveTab("all")}
                  >
                    Browse All Events
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default EventsPage;