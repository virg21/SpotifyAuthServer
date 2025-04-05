import { 
  users, type User, type InsertUser, 
  type MusicSummary, type Event, type VerificationCode, type Playlist,
  musicSummaries, events, verificationCodes, playlists
} from "@shared/schema";
import { db } from "./db";
import { and, asc, desc, eq, gte, like, lt, lte, or, sql } from "drizzle-orm";

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
  
  // Playlist methods
  getPlaylistById(id: number): Promise<Playlist | undefined>;
  getPlaylistsByUserId(userId: number): Promise<Playlist[]>;
  getPlaylistsByEventId(eventId: number): Promise<Playlist[]>;
  createPlaylist(playlist: Omit<Playlist, 'id'>): Promise<Playlist>;
  updatePlaylist(id: number, playlistData: Partial<Playlist>): Promise<Playlist | undefined>;
  deletePlaylist(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private musicSummaries: Map<number, MusicSummary>;
  private verificationCodes: Map<number, VerificationCode>;
  private events: Map<number, Event>;
  private playlists: Map<number, Playlist>;
  private userId: number;
  private musicSummaryId: number;
  private verificationCodeId: number;
  private eventId: number;
  private playlistId: number;

  constructor() {
    this.users = new Map();
    this.musicSummaries = new Map();
    this.verificationCodes = new Map();
    this.events = new Map();
    this.playlists = new Map();
    this.userId = 1;
    this.musicSummaryId = 1;
    this.verificationCodeId = 1;
    this.eventId = 1;
    this.playlistId = 1;
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

  // Playlist methods
  async getPlaylistById(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getPlaylistsByUserId(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(
      playlist => playlist.userId === userId
    );
  }

  async getPlaylistsByEventId(eventId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(
      playlist => playlist.eventId === eventId
    );
  }

  async createPlaylist(playlistData: Omit<Playlist, 'id'>): Promise<Playlist> {
    const id = this.playlistId++;
    const playlist: Playlist = { ...playlistData, id, createdAt: new Date() };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async updatePlaylist(id: number, playlistData: Partial<Playlist>): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;
    
    const updatedPlaylist = { ...playlist, ...playlistData, updatedAt: new Date() };
    this.playlists.set(id, updatedPlaylist);
    return updatedPlaylist;
  }

  async deletePlaylist(id: number): Promise<boolean> {
    return this.playlists.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserBySpotifyId(spotifyId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.spotifyId, spotifyId));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async getMusicSummary(userId: number): Promise<MusicSummary | undefined> {
    const [summary] = await db
      .select()
      .from(musicSummaries)
      .where(eq(musicSummaries.userId, userId));
    return summary || undefined;
  }

  async createMusicSummary(summaryData: Omit<MusicSummary, 'id'>): Promise<MusicSummary> {
    const [summary] = await db
      .insert(musicSummaries)
      .values(summaryData)
      .returning();
    return summary;
  }

  async updateMusicSummary(id: number, data: Partial<MusicSummary>): Promise<MusicSummary | undefined> {
    const [updatedSummary] = await db
      .update(musicSummaries)
      .set(data)
      .where(eq(musicSummaries.id, id))
      .returning();
    return updatedSummary || undefined;
  }

  async updateUserLocation(userId: number, latitude: number, longitude: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ latitude, longitude })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async updateUserNotifications(userId: number, enabled: boolean): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ notificationsEnabled: enabled })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async saveVerificationCode(userId: number, code: string, expiresAt: Date): Promise<VerificationCode> {
    const [verificationCode] = await db
      .insert(verificationCodes)
      .values({
        userId,
        code,
        expiresAt,
        verified: false,
        createdAt: new Date()
      })
      .returning();
    return verificationCode;
  }

  async getVerificationCode(userId: number, code: string): Promise<VerificationCode | undefined> {
    const [verificationCode] = await db
      .select()
      .from(verificationCodes)
      .where(and(
        eq(verificationCodes.userId, userId),
        eq(verificationCodes.code, code),
        lt(new Date(), verificationCodes.expiresAt)
      ));
    return verificationCode || undefined;
  }

  async markVerificationCodeAsVerified(id: number): Promise<VerificationCode | undefined> {
    const [verificationCode] = await db
      .update(verificationCodes)
      .set({ verified: true })
      .where(eq(verificationCodes.id, id))
      .returning();
    return verificationCode || undefined;
  }

  async markUserEmailAsVerified(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async markUserPhoneAsVerified(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ phoneVerified: true })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getEvents(latitude: number, longitude: number, radius: number): Promise<Event[]> {
    // For a proper geo-search, we'd need PostGIS/spatial index
    // This is a simple approximation using the Pythagorean theorem 
    // (works for smaller distances, not accurate over large distances)
    return db
      .select()
      .from(events)
      .where(
        and(
          gte(events.date, new Date()),
          lte(
            sql`POWER(${events.latitude} - ${latitude}, 2) + POWER(${events.longitude} - ${longitude}, 2)`,
            sql`POWER(${radius} / 111, 2)` // rough conversion from km to degrees (1 degree ≈ 111 km)
          )
        )
      )
      .orderBy(asc(events.date));
  }

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events);
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    return event || undefined;
  }

  async getEventByExternalId(externalId: string): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.externalId, externalId));
    return event || undefined;
  }

  async createEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(eventData)
      .returning();
    return event;
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(eq(events.id, id));
    return result.count > 0;
  }

  async searchEvents(query: string, limit: number = 50): Promise<Event[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return db
      .select()
      .from(events)
      .where(
        or(
          like(events.name, searchTerm),
          like(events.description, searchTerm),
          like(events.venue, searchTerm),
          like(events.genre, searchTerm)
        )
      )
      .limit(limit);
  }

  async getEventsByGenre(genre: string): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(like(events.genre, `%${genre.toLowerCase()}%`))
      .orderBy(asc(events.date));
  }

  async getUpcomingEvents(days: number = 30): Promise<Event[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return db
      .select()
      .from(events)
      .where(
        and(
          gte(events.date, now),
          lte(events.date, futureDate)
        )
      )
      .orderBy(asc(events.date));
  }

  async getPlaylistById(id: number): Promise<Playlist | undefined> {
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, id));
    return playlist || undefined;
  }

  async getPlaylistsByUserId(userId: number): Promise<Playlist[]> {
    return db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, userId))
      .orderBy(desc(playlists.createdAt));
  }

  async getPlaylistsByEventId(eventId: number): Promise<Playlist[]> {
    return db
      .select()
      .from(playlists)
      .where(eq(playlists.eventId, eventId))
      .orderBy(desc(playlists.createdAt));
  }

  async createPlaylist(playlistData: Omit<Playlist, 'id'>): Promise<Playlist> {
    const [playlist] = await db
      .insert(playlists)
      .values({
        ...playlistData,
        createdAt: new Date()
      })
      .returning();
    return playlist;
  }

  async updatePlaylist(id: number, playlistData: Partial<Playlist>): Promise<Playlist | undefined> {
    const [playlist] = await db
      .update(playlists)
      .set(playlistData)
      .where(eq(playlists.id, id))
      .returning();
    return playlist || undefined;
  }

  async deletePlaylist(id: number): Promise<boolean> {
    const result = await db
      .delete(playlists)
      .where(eq(playlists.id, id));
    return result.count > 0;
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
