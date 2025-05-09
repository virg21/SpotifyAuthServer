import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  emailVerified: boolean("email_verified").default(false),
  birthday: text("birthday"),
  spotifyId: text("spotify_id").unique(),
  spotifyAccessToken: text("spotify_access_token"),
  spotifyRefreshToken: text("spotify_refresh_token"),
  spotifyVerified: boolean("spotify_verified").default(false), // New field to track if Spotify auth is completed
  profileImage: text("profile_image"), // Profile image URL (can be from Spotify)
  preferredGenres: jsonb("preferred_genres").default([]), // User's manually set preferred genres
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  notificationsEnabled: boolean("notifications_enabled").default(false),
  phone: text("phone"), // Using consistent naming with the schema
  phoneVerified: boolean("phone_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const musicSummaries = pgTable("music_summaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  topArtists: jsonb("top_artists").notNull(),
  topTracks: jsonb("top_tracks").notNull(),
  topGenres: jsonb("top_genres").notNull(),
  recentGenres: jsonb("recent_genres").default([]),
  moodScore: jsonb("mood_score").notNull(),
  genreProfile: jsonb("genre_profile").notNull(),
  eraBias: jsonb("era_bias").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  venue: text("venue").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  ticketUrl: text("ticket_url"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  genre: text("genre"),
  source: text("source"),
  externalId: text("external_id").unique(),
  price: text("price"), // Store price range (e.g., "$30-$50" or "Free Entry")
  reason: text("reason"), // Personal recommendation reason based on user's music profile
  city: text("city"), // City where the event takes place
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").references(() => events.id),
  spotifyPlaylistId: text("spotify_playlist_id"),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  tracks: jsonb("tracks").notNull(),
  mood: varchar("mood", { length: 50 }),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  emailVerified: true,
  birthday: true,
  spotifyId: true,
  spotifyAccessToken: true,
  spotifyRefreshToken: true,
  spotifyVerified: true,
  profileImage: true,
  preferredGenres: true,
  phone: true,
  phoneVerified: true,
  notificationsEnabled: true,
});

export const updateUserProfileSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  birthday: z.string().optional(),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
  preferredGenres: z.array(z.string()).optional(),
});

export const updateUserLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const updateNotificationsSchema = z.object({
  notificationsEnabled: z.boolean(),
});

export const verifyPhoneSchema = z.object({
  phone: z.string(),
});

export const verifyCodeSchema = z.object({
  code: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const musicSummarySchema = createInsertSchema(musicSummaries);
export const eventSchema = createInsertSchema(events);
export const playlistSchema = createInsertSchema(playlists);

export const createPlaylistSchema = z.object({
  eventId: z.number(),
  mood: z.enum(['energetic', 'relaxed', 'upbeat', 'melancholic', 'party', 'focused', 'romantic']).optional(),
  playlistName: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MusicSummary = typeof musicSummaries.$inferSelect;
export type Event = typeof events.$inferSelect;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type Playlist = typeof playlists.$inferSelect;
