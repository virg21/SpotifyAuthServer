import { FC, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Event } from "@shared/schema";
import MobileLayout from "@/components/MobileLayout";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ShareStoryboard from "../components/ShareStoryboard";

// Genre-based image URLs (shared with events.tsx)
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
}

// Helper function to get image based on event genre or type (similar to events.tsx)
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

// Function that will be overridden by the page component
let handleGeneratePlaylist = (event: EventWithRelevance) => {
  console.log("Default playlist generator called", event);
  // This is a placeholder that will be replaced by the actual implementation
};

// Function that will be overridden by the page component
let handleShareEvent = (event: EventWithRelevance) => {
  console.log("Default share handler called", event);
  // This is a placeholder that will be replaced by the actual implementation
};

// Simple event card component based on the mockup
const SimpleEventCard: FC<{ event: EventWithRelevance }> = ({ event }) => {
  // Generate price display or free entry text
  const priceDisplay = event.price ? event.price : "Free Entry";
  
  // Helper function to generate appropriate icon based on event genre/type
  const getEventIcon = () => {
    const genre = event.genre?.toLowerCase();
    
    if (event.name.includes("Jay Z") || (genre && (genre.includes("hip") || genre.includes("hop")))) {
      return "🎤";
    } else if (genre && genre.includes("jazz")) {
      return "🎷";
    } else if (genre && genre.includes("soul")) {
      return "🎵";
    } else if (event.name.includes("Rick")) {
      return "🎧";
    }
    
    return "🎵"; // Default icon
  };
  
  const getPersonalReason = () => {
    // If we have a specific personal reason, return that
    if (event.personalReason) {
      // Format with icon at the beginning
      if (event.personalReason.startsWith("Because")) {
        return `${getEventIcon()} ${event.personalReason}`;
      } else if (event.personalReason.startsWith("Since")) {
        return `${getEventIcon()} ${event.personalReason}`;
      } else if (event.personalReason.startsWith("Your favorite")) {
        return `🎤 ${event.personalReason}`;
      } else if (event.personalReason.startsWith("Your most")) {
        return `🎧 ${event.personalReason}`;
      }
      return `${getEventIcon()} ${event.personalReason}`;
    }
    return null;
  };

  // Get appropriate event image based on genre
  const eventImage = getEventImage(event);

  return (
    <div className="mb-4">
      <div className="bg-gray-100 rounded-md aspect-square flex items-center justify-center overflow-hidden relative">
        <img 
          src={eventImage} 
          alt={event.name} 
          className="w-full h-full object-cover"
        />
        {/* Action buttons overlay */}
        <div className="absolute bottom-2 right-2 flex space-x-2">
          {/* Share button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleShareEvent(event);
            }}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-md"
            title="Share this event"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
          
          {/* Playlist button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleGeneratePlaylist(event);
            }}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-md"
            title="Generate a playlist for this event"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </button>
        </div>
      </div>
      <h3 className="font-bold mt-2 text-gray-800">{event.name}</h3>
      <p className="text-sm text-gray-600 mt-1">
        {getPersonalReason() || event.venue}
      </p>
      <p className="text-sm text-gray-600 mt-1">{priceDisplay}</p>
    </div>
  );
};

const MobileEventsPage: FC = () => {
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [shareStoryboardOpen, setShareStoryboardOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithRelevance | null>(null);
  const [selectedMood, setSelectedMood] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [createdPlaylistUrl, setCreatedPlaylistUrl] = useState("");
  const { toast } = useToast();
  
  // Mock user ID - in a real app, this would come from auth context
  const userId = 1;
  
  // Fetch personalized recommendations
  const { data: personalizedData, isLoading } = useQuery<{ count: number, events: EventWithRelevance[] }>({
    queryKey: ["/api/recommendations/personal"],
  });
  
  // Mutation for creating a playlist
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
        }, 500);
      }, 3000);
    },
    onError: (error) => {
      setIsCreatingPlaylist(false);
      toast({
        title: "Error",
        description: error.message || "Failed to create playlist. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle generate playlist function (will be used by event cards)
  const handleGeneratePlaylistLocal = (event: EventWithRelevance) => {
    setSelectedEvent(event);
    // Default playlist name based on event
    setPlaylistName(`${event.name} - ${event.genre || 'Mix'}`);
    // Open the dialog
    setPlaylistDialogOpen(true);
  };
  
  // Handle share event function (will be used by event cards)
  const handleShareEventLocal = (event: EventWithRelevance) => {
    setSelectedEvent(event);
    // Open the share storyboard
    setShareStoryboardOpen(true);
  };
  
  // Use effect to set the global handler functions
  useEffect(() => {
    // Override the global implementations
    handleGeneratePlaylist = handleGeneratePlaylistLocal;
    handleShareEvent = handleShareEventLocal;
    
    // Cleanup function to reset global handlers when component unmounts
    return () => {
      handleGeneratePlaylist = (event) => {
        console.log("Default playlist generator called", event);
      };
      handleShareEvent = (event) => {
        console.log("Default share handler called", event);
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
  
  // Use either real data or dummy data for demonstration purposes
  const events = personalizedData?.events || [
    {
      id: 1,
      name: "Jazz Night @ The Dawson",
      venue: "The Dawson",
      description: "A night of classic jazz tunes",
      date: new Date(),
      price: "Free Entry",
      latitude: 41.9,
      longitude: -87.6,
      personalReason: "Because you've been listening to Coltrane and Chet Baker",
      externalId: "jazz-night-1",
      genre: "Jazz",
      ticketUrl: null,
      imageUrl: null,
      source: null,
      reason: null,
      city: "Chicago",
      relevanceScore: 0.92
    },
    {
      id: 2,
      name: "Neo-Soul Brunch @ The Listening Room",
      venue: "The Listening Room",
      description: "Sunday brunch with neo-soul vibes",
      date: new Date(),
      price: "$30–$50",
      latitude: 41.89,
      longitude: -87.62,
      personalReason: "Since you love Snoh Aalegra and vibey Sunday tracks",
      externalId: "neo-soul-1",
      genre: "Neo-Soul",
      ticketUrl: null,
      imageUrl: null,
      source: null,
      reason: null,
      city: "Chicago",
      relevanceScore: 0.88
    },
    {
      id: 3,
      name: "Jay Z - Brozeville Winery",
      venue: "Brozeville Winery",
      description: "Jay Z performing live",
      date: new Date(),
      price: "Free entry",
      latitude: 41.88,
      longitude: -87.64,
      personalReason: "Your favorite rapper Jay Z just ate at this restaurant",
      externalId: "jay-z-1",
      genre: "Hip-Hop",
      ticketUrl: null,
      imageUrl: null,
      source: null,
      reason: null,
      city: "Chicago",
      relevanceScore: 0.95
    },
    {
      id: 4,
      name: "Slick Rick at the Aragon Ballroom",
      venue: "Aragon Ballroom",
      description: "Slick Rick live in concert",
      date: new Date(),
      price: "$60–$120",
      latitude: 41.87,
      longitude: -87.66,
      personalReason: "Your most streamed artist in 2024 is doing a small show in Chicago",
      externalId: "slick-rick-1",
      genre: "Hip-Hop",
      ticketUrl: null,
      imageUrl: null,
      source: null,
      reason: null,
      city: "Chicago",
      relevanceScore: 0.85
    }
  ];
  
  const eventCount = events.length;
  
  return (
    <MobileLayout>
      <div className="px-5 py-4">
        {/* Magnifying glass and title */}
        <div className="flex items-center mb-2">
          <div className="text-gray-800 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quincy Found {eventCount} Spots that Fit Your Vibe in Chicago
          </h1>
        </div>
        
        {/* Subtitle */}
        <p className="text-gray-600 mb-4">
          Based on your listening behavior, Quincy made these moves just for you
        </p>
        
        {/* Event grid - 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          {events.map((event) => (
            <SimpleEventCard key={event.id} event={event} />
          ))}
        </div>
        
        {/* Playlist generation button */}
        <button 
          className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md font-medium my-3 flex items-center justify-center"
          onClick={() => {
            // Select the first event in the list for playlist generation
            if (events.length > 0) {
              handleGeneratePlaylist(events[0]);
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          Create Event Playlist
        </button>
        
        {/* Share event button */}
        <button 
          className="w-full py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-md font-medium mb-3 flex items-center justify-center"
          onClick={() => {
            // Select the first event in the list for sharing
            if (events.length > 0) {
              handleShareEvent(events[0]);
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share This Event
        </button>
        
        {/* Turn on notifications button */}
        <button className="w-full py-3 bg-gray-800 text-white rounded-md font-medium mb-4">
          Turn On Notifications
        </button>
        
        {/* Playlist generation dialog */}
        <Dialog open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Spotify Playlist</DialogTitle>
              <DialogDescription>
                Generate a playlist for this event based on your music taste.
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
                <h3 className="text-lg font-semibold">Playlist created!</h3>
                <p className="text-sm text-muted-foreground">Your new playlist is now on Spotify</p>
                
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
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setPlaylistDialogOpen(false)}
                    disabled={isCreatingPlaylist}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="gap-1 bg-gradient-primary hover:opacity-90 text-white" 
                    onClick={handleCreatePlaylist}
                    disabled={isCreatingPlaylist}
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
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18V5l12-2v13" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="16" r="3" />
                        </svg>
                        Create Playlist
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white py-3 px-8 flex justify-between">
          <Link href="/dashboard" className="flex flex-col items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/explore" className="flex flex-col items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs mt-1">Explore</span>
          </Link>
        </div>
        
        {/* Share Storyboard Component */}
        <ShareStoryboard 
          event={selectedEvent}
          isOpen={shareStoryboardOpen}
          onClose={() => setShareStoryboardOpen(false)}
        />
      </div>
    </MobileLayout>
  );
};

export default MobileEventsPage;