import { FC, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatDistance, format } from "date-fns";
import { Event } from "@shared/schema";
import { cn } from "@/lib/utils";

// Genre-based image URLs
const GENRE_IMAGES = {
  jazz: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop",
  rock: "https://images.unsplash.com/photo-1559519530-746235b23764?q=80&w=800&auto=format&fit=crop",
  hiphop: "https://images.unsplash.com/photo-1547355253-ff0740f6e8c1?q=80&w=800&auto=format&fit=crop",
  pop: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=800&auto=format&fit=crop",
  electronic: "https://images.unsplash.com/photo-1571397133301-3f1b6e19284f?q=80&w=800&auto=format&fit=crop",
  classical: "https://images.unsplash.com/photo-1468164016595-6108e4c60c8b?q=80&w=800&auto=format&fit=crop",
  rb: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop"
};

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
  isRecommended?: boolean;
}

// Helper function to get image based on event genre or type
const getEventImage = (event: EventWithRelevance): string => {
  // If event has a direct image URL, use that
  if (event.imageUrl) {
    return event.imageUrl;
  }
  
  // Check genre to determine appropriate image
  const genre = event.genre?.toLowerCase() || '';
  const eventName = event.name.toLowerCase();
  const eventDescription = event.description?.toLowerCase() || '';
  
  // Check for different genres/instruments
  if (genre.includes('jazz') || eventName.includes('jazz') || eventDescription.includes('jazz')) {
    return GENRE_IMAGES.jazz;
  } else if (genre.includes('hip') || genre.includes('hop') || genre.includes('rap') || 
            eventName.includes('rap') || eventDescription.includes('hip-hop')) {
    return GENRE_IMAGES.hiphop;
  } else if (genre.includes('rock') || eventName.includes('rock')) {
    return GENRE_IMAGES.rock;
  } else if (genre.includes('pop') || eventName.includes('pop')) {
    return GENRE_IMAGES.pop;
  } else if (genre.includes('electronic') || genre.includes('edm') || genre.includes('dj') || 
            eventName.includes('dj') || eventDescription.includes('electronic')) {
    return GENRE_IMAGES.electronic;
  } else if (genre.includes('classical') || genre.includes('orchestra') || 
            eventName.includes('symphony') || eventDescription.includes('classical')) {
    return GENRE_IMAGES.classical;
  } else if (genre.includes('r&b') || genre.includes('soul') || 
            eventName.includes('soul') || eventDescription.includes('r&b')) {
    return GENRE_IMAGES.rb;
  }
  
  // Default concert image for other genres
  return GENRE_IMAGES.default;
};

const EventCard: FC<{ event: EventWithRelevance }> = ({ event }) => {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const formattedDate = format(eventDate, "MMM d, yyyy • h:mm a");
  const timeUntil = isUpcoming 
    ? formatDistance(eventDate, new Date(), { addSuffix: true })
    : "Event has passed";
  
  // Calculate if the event is happening soon (within 7 days)
  const isHappeningSoon = isUpcoming && (eventDate.getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000;
  
  // Get appropriate image for the event
  const eventImage = getEventImage(event);

  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-lg border-neutral-200 hover:border-primary/20">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={eventImage} 
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
            onClick={() => handleGeneratePlaylist(event)}
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

// This function will be implemented by the EventsPage component
let handleGeneratePlaylist = (event: EventWithRelevance) => {
  console.log("Default playlist generator called", event);
  // This is a placeholder that will be replaced by the actual implementation
};

const EventsPage: FC = () => {
  const [activeTab, setActiveTab] = useState("personalized");
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithRelevance | null>(null);
  const [selectedMood, setSelectedMood] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [createdPlaylistUrl, setCreatedPlaylistUrl] = useState("");
  const { toast } = useToast();
  
  // Mock user ID - in a real app, this would come from auth context
  const userId = 1; // This would come from authentication context
  
  // Fetch all available moods, including personalized ones
  const { data: moodsData, isLoading: moodsLoading } = useQuery<{ count: number, moods: MoodCategory[], recommendedMoods: string[] }>({
    queryKey: ["/api/recommendations/moods"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch moods');
      return res.json();
    }
  });
  
  // Fetch personalized recommendations
  const { data: personalizedData, isLoading: personalizedLoading } = useQuery<{ count: number, events: EventWithRelevance[] }>({
    queryKey: ["/api/recommendations/personal"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch personalized recommendations');
      return res.json();
    }
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
  
  // Generate playlist mutation
  const generatePlaylistMutation = useMutation({
    mutationFn: async (data: { eventId: number; mood?: string; playlistName?: string }) => {
      const response = await fetch('/api/playlists/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create playlist');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCreatedPlaylistUrl(data.spotifyUrl);
      setIsCreatingPlaylist(false);
      toast({
        title: "Playlist created!",
        description: "Your Spotify playlist has been generated successfully.",
      });
      // Close dialog after a short delay to show success state
      setTimeout(() => {
        setPlaylistDialogOpen(false);
        // Reset states
        setTimeout(() => {
          setSelectedEvent(null);
          setSelectedMood("");
          setPlaylistName("");
          setCreatedPlaylistUrl("");
        }, 300);
      }, 1500);
    },
    onError: (error) => {
      setIsCreatingPlaylist(false);
      toast({
        title: "Playlist creation failed",
        description: error.message || "An error occurred while creating your playlist. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Local implementation of handleGeneratePlaylist
  const handleGeneratePlaylistLocal = (event: EventWithRelevance) => {
    setSelectedEvent(event);
    // Default playlist name based on event
    setPlaylistName(`${event.name} - ${event.genre || 'Mix'}`);
    // Open the dialog
    setPlaylistDialogOpen(true);
  };

  // Use effect to set the global handleGeneratePlaylist function
  useEffect(() => {
    // Override the global implementation
    handleGeneratePlaylist = handleGeneratePlaylistLocal;
    
    // Cleanup function to reset handleGeneratePlaylist when component unmounts
    return () => {
      handleGeneratePlaylist = (event) => {
        console.log("Default playlist generator called", event);
      };
    };
  }, []);

  const handleCreatePlaylist = () => {
    if (!selectedEvent) return;
    
    setIsCreatingPlaylist(true);
    generatePlaylistMutation.mutate({
      eventId: selectedEvent.id,
      mood: selectedMood || undefined,
      playlistName: playlistName || undefined,
    });
  };

  return (
    <div className="p-6 pt-4 lg:ml-64">
      {/* Playlist generation dialog */}
      <Dialog open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Spotify Playlist</DialogTitle>
            <DialogDescription>
              Create a personalized playlist for this event based on your music taste.
            </DialogDescription>
          </DialogHeader>
          
          {createdPlaylistUrl ? (
            <div className="space-y-4 py-4 text-center">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold">Playlist created successfully!</h3>
              <p className="text-sm text-muted-foreground">Your personalized playlist is now available on Spotify</p>
              
              <div className="mt-4">
                <Button 
                  className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90"
                  onClick={() => window.open(createdPlaylistUrl, '_blank')}
                >
                  Open in Spotify
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="playlist-name">Playlist Name</Label>
                  <Input
                    id="playlist-name"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="Enter a name for your playlist"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mood">Playlist Mood</Label>
                  <Select 
                    value={selectedMood} 
                    onValueChange={setSelectedMood}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a mood for your playlist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Auto (based on the event)</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                      <SelectItem value="upbeat">Upbeat</SelectItem>
                      <SelectItem value="melancholic">Melancholic</SelectItem>
                      <SelectItem value="party">Party</SelectItem>
                      <SelectItem value="focused">Focused</SelectItem>
                      <SelectItem value="romantic">Romantic</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecting a mood will adjust the energy and vibe of your playlist
                  </p>
                </div>
              </div>
              
              <DialogFooter className="sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPlaylistDialogOpen(false)}
                  disabled={isCreatingPlaylist}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreatePlaylist}
                  disabled={isCreatingPlaylist}
                  className="bg-gradient-primary hover:opacity-90 text-white"
                >
                  {isCreatingPlaylist ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Playlist"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
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
                    className={cn(
                      "mr-2 mb-2 data-[state=active]:bg-primary data-[state=active]:text-white",
                      mood.isRecommended && "border-2 border-primary/30"
                    )}
                    title={`${mood.isRecommended ? '🎯 Recommended based on your music taste! ' : ''}Keywords: ${mood.keywords}`}
                  >
                    {mood.isRecommended && <span className="mr-1">🎵</span>}
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