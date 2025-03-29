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
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  notificationsEnabled: boolean("notifications_enabled").default(false),
  phoneNumber: text("phone_number"),
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
  moodScore: integer("mood_score"),
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
  accessToken: true,
  refreshToken: true,
  phoneNumber: true,
  phoneVerified: true,
  notificationsEnabled: true,
});

export const updateUserProfileSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  birthday: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export const updateUserLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const updateNotificationsSchema = z.object({
  notificationsEnabled: z.boolean(),
});

export const verifyPhoneSchema = z.object({
  phoneNumber: z.string(),
});

export const verifyCodeSchema = z.object({
  code: z.string(),
  email: z.string().email(),
});

export const musicSummarySchema = createInsertSchema(musicSummaries);
export const eventSchema = createInsertSchema(events);
export const playlistSchema = createInsertSchema(playlists);

export const createPlaylistSchema = z.object({
  eventId: z.number(),
  mood: z.enum(['energetic', 'chill', 'happy', 'focused', 'party', 'romantic']).optional(),
  playlistName: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MusicSummary = typeof musicSummaries.$inferSelect;
export type Event = typeof events.$inferSelect;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type Playlist = typeof playlists.$inferSelect;
