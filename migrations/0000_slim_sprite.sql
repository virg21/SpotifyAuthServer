CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"venue" text NOT NULL,
	"date" timestamp NOT NULL,
	"description" text,
	"image_url" text,
	"ticket_url" text,
	"latitude" double precision,
	"longitude" double precision,
	"genre" text,
	"source" text,
	"external_id" text,
	"price" text,
	"reason" text,
	"city" text,
	CONSTRAINT "events_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "music_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"top_artists" jsonb NOT NULL,
	"top_tracks" jsonb NOT NULL,
	"top_genres" jsonb NOT NULL,
	"recent_genres" jsonb DEFAULT '[]'::jsonb,
	"mood_score" jsonb NOT NULL,
	"genre_profile" jsonb NOT NULL,
	"era_bias" jsonb NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_id" integer,
	"spotify_playlist_id" text,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"tracks" jsonb NOT NULL,
	"mood" varchar(50),
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"display_name" text,
	"email" text,
	"email_verified" boolean DEFAULT false,
	"birthday" text,
	"spotify_id" text,
	"spotify_access_token" text,
	"spotify_refresh_token" text,
	"latitude" double precision,
	"longitude" double precision,
	"notifications_enabled" boolean DEFAULT false,
	"phone_number" text,
	"phone_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_spotify_id_unique" UNIQUE("spotify_id")
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "music_summaries" ADD CONSTRAINT "music_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;