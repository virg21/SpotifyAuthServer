import { 
  users, type User, type InsertUser, 
  type MusicSummary, type Event, type VerificationCode,
  musicSummaries, events, verificationCodes
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserBySpotifyId(spotifyId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Music summary methods
  getMusicSummary(userId: number): Promise<MusicSummary | undefined>;
  createMusicSummary(summary: Omit<MusicSummary, 'id'>): Promise<MusicSummary>;
  updateMusicSummary(id: number, data: Partial<MusicSummary>): Promise<MusicSummary | undefined>;
  
  // Location methods
  updateUserLocation(userId: number, latitude: number, longitude: number): Promise<User | undefined>;
  
  // Notification methods
  updateUserNotifications(userId: number, enabled: boolean): Promise<User | undefined>;
  
  // Verification methods
  saveVerificationCode(userId: number, code: string, expiresAt: Date): Promise<VerificationCode>;
  getVerificationCode(userId: number, code: string): Promise<VerificationCode | undefined>;
  markVerificationCodeAsVerified(id: number): Promise<VerificationCode | undefined>;
  markUserEmailAsVerified(userId: number): Promise<User | undefined>;
  markUserPhoneAsVerified(userId: number): Promise<User | undefined>;
  
  // Events methods
  getEvents(latitude: number, longitude: number, radius: number): Promise<Event[]>;
  getAllEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  getEventByExternalId(externalId: string): Promise<Event | undefined>;
  createEvent(event: Omit<Event, 'id'>): Promise<Event>;
  updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  searchEvents(query: string, limit?: number): Promise<Event[]>;
  getEventsByGenre(genre: string): Promise<Event[]>;
  getUpcomingEvents(days?: number): Promise<Event[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private musicSummaries: Map<number, MusicSummary>;
  private verificationCodes: Map<number, VerificationCode>;
  private events: Map<number, Event>;
  private userId: number;
  private musicSummaryId: number;
  private verificationCodeId: number;
  private eventId: number;

  constructor() {
    this.users = new Map();
    this.musicSummaries = new Map();
    this.verificationCodes = new Map();
    this.events = new Map();
    this.userId = 1;
    this.musicSummaryId = 1;
    this.verificationCodeId = 1;
    this.eventId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserBySpotifyId(spotifyId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.spotifyId === spotifyId,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Create a new user without the problematic spread
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      displayName: insertUser.displayName || null,
      email: insertUser.email || null,
      emailVerified: false,
      birthday: insertUser.birthday || null,
      spotifyId: insertUser.spotifyId || null,
      accessToken: insertUser.accessToken || null,
      refreshToken: insertUser.refreshToken || null,
      latitude: null,
      longitude: null,
      notificationsEnabled: false,
      phoneNumber: null,
      phoneVerified: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Music summary methods
  async getMusicSummary(userId: number): Promise<MusicSummary | undefined> {
    return Array.from(this.musicSummaries.values()).find(
      (summary) => summary.userId === userId,
    );
  }
  
  async createMusicSummary(summaryData: Omit<MusicSummary, 'id'>): Promise<MusicSummary> {
    const id = this.musicSummaryId++;
    const summary: MusicSummary = { ...summaryData, id };
    this.musicSummaries.set(id, summary);
    return summary;
  }
  
  async updateMusicSummary(id: number, data: Partial<MusicSummary>): Promise<MusicSummary | undefined> {
    const summary = this.musicSummaries.get(id);
    if (!summary) return undefined;
    
    const updatedSummary = { ...summary, ...data, lastUpdated: new Date() };
    this.musicSummaries.set(id, updatedSummary);
    return updatedSummary;
  }
  
  // Location methods
  async updateUserLocation(userId: number, latitude: number, longitude: number): Promise<User | undefined> {
    return this.updateUser(userId, { latitude, longitude });
  }
  
  // Notification methods
  async updateUserNotifications(userId: number, enabled: boolean): Promise<User | undefined> {
    return this.updateUser(userId, { notificationsEnabled: enabled });
  }
  
  // Phone verification methods
  async saveVerificationCode(userId: number, code: string, expiresAt: Date): Promise<VerificationCode> {
    const id = this.verificationCodeId++;
    const verificationCode: VerificationCode = {
      id,
      userId,
      code,
      expiresAt,
      verified: false,
    };
    this.verificationCodes.set(id, verificationCode);
    return verificationCode;
  }
  
  async getVerificationCode(userId: number, code: string): Promise<VerificationCode | undefined> {
    return Array.from(this.verificationCodes.values()).find(
      (vc) => vc.userId === userId && vc.code === code && !vc.verified && vc.expiresAt > new Date(),
    );
  }
  
  async markVerificationCodeAsVerified(id: number): Promise<VerificationCode | undefined> {
    const code = this.verificationCodes.get(id);
    if (!code) return undefined;
    
    const updatedCode = { ...code, verified: true };
    this.verificationCodes.set(id, updatedCode);
    return updatedCode;
  }
  
  async markUserEmailAsVerified(userId: number): Promise<User | undefined> {
    return this.updateUser(userId, { emailVerified: true });
  }
  
  async markUserPhoneAsVerified(userId: number): Promise<User | undefined> {
    return this.updateUser(userId, { phoneVerified: true });
  }
  
  // Events methods
  async getEvents(latitude: number, longitude: number, radius: number): Promise<Event[]> {
    // Calculate distance between coordinates using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };
    
    return Array.from(this.events.values()).filter(event => {
      if (!event.latitude || !event.longitude) return false;
      const distance = calculateDistance(latitude, longitude, event.latitude, event.longitude);
      return distance <= radius;
    });
  }
  
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEventById(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEventByExternalId(externalId: string): Promise<Event | undefined> {
    return Array.from(this.events.values()).find(
      (event) => event.externalId === externalId
    );
  }
  
  async createEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
    // First, check if we already have this event by external ID to avoid duplicates
    if (eventData.externalId) {
      const existingEvent = await this.getEventByExternalId(eventData.externalId);
      if (existingEvent) {
        // Update the existing event
        return this.updateEvent(existingEvent.id, eventData) as Promise<Event>;
      }
    }
    
    // Create a new event
    const id = this.eventId++;
    const event: Event = { ...eventData, id };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  async searchEvents(query: string, limit: number = 50): Promise<Event[]> {
    const lowerQuery = query.toLowerCase();
    
    // Filter events that match the query in name, venue, or description
    const filteredEvents = Array.from(this.events.values()).filter(event => {
      return (
        (event.name && event.name.toLowerCase().includes(lowerQuery)) ||
        (event.venue && event.venue.toLowerCase().includes(lowerQuery)) ||
        (event.description && event.description.toLowerCase().includes(lowerQuery)) ||
        (event.genre && event.genre.toLowerCase().includes(lowerQuery))
      );
    });
    
    // Sort by date and return limited results
    return filteredEvents
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limit);
  }
  
  async getEventsByGenre(genre: string): Promise<Event[]> {
    const lowerGenre = genre.toLowerCase();
    
    return Array.from(this.events.values()).filter(event => 
      event.genre && event.genre.toLowerCase() === lowerGenre
    );
  }
  
  async getUpcomingEvents(days: number = 30): Promise<Event[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return Array.from(this.events.values())
      .filter(event => {
        return event.date >= now && event.date <= futureDate;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

export const storage = new MemStorage();
