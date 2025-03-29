import { 
  users, type User, type InsertUser, 
  type MusicSummary, type Event, type VerificationCode,
  musicSummaries, events, verificationCodes
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserBySpotifyId(spotifyId: string): Promise<User | undefined>;
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
  
  // Phone verification methods
  saveVerificationCode(userId: number, code: string, expiresAt: Date): Promise<VerificationCode>;
  getVerificationCode(userId: number, code: string): Promise<VerificationCode | undefined>;
  markVerificationCodeAsVerified(id: number): Promise<VerificationCode | undefined>;
  
  // Events methods
  getEvents(latitude: number, longitude: number, radius: number): Promise<Event[]>;
  createEvent(event: Omit<Event, 'id'>): Promise<Event>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Create a new user without the problematic spread
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      displayName: insertUser.displayName || null,
      email: insertUser.email || null,
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
  
  async createEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
    const id = this.eventId++;
    const event: Event = { ...eventData, id };
    this.events.set(id, event);
    return event;
  }
}

export const storage = new MemStorage();
