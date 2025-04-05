import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import MobileLayout from "@/components/MobileLayout";
import { Link } from "wouter";

interface EventWithRelevance extends Event {
  relevanceScore?: number;
  personalReason?: string;
}

interface MoodCategory {
  id: string;
  name: string;
  keywords: string;
}

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

  return (
    <div className="mb-4">
      <div className="bg-gray-100 rounded-md aspect-square flex items-center justify-center overflow-hidden">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
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
  // Fetch personalized recommendations
  const { data: personalizedData, isLoading } = useQuery<{ count: number, events: EventWithRelevance[] }>({
    queryKey: ["/api/recommendations/personal"],
  });
  
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
      scraperSource: null,
      createdAt: new Date()
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
      scraperSource: null,
      createdAt: new Date()
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
      personalReason: "Your favorite rapper Jay Z just ate at this resrestaurant",
      externalId: "jay-z-1",
      genre: "Hip-Hop",
      ticketUrl: null,
      imageUrl: null,
      scraperSource: null,
      createdAt: new Date()
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
      scraperSource: null,
      createdAt: new Date()
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
        
        {/* Turn on notifications button */}
        <button className="w-full py-3 bg-gray-800 text-white rounded-md font-medium my-4">
          Turn On Notifications
        </button>
        
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
      </div>
    </MobileLayout>
  );
};

export default MobileEventsPage;