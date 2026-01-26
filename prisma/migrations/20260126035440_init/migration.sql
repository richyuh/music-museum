-- CreateTable
CREATE TABLE "albums" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "artist_name" TEXT NOT NULL,
    "release_year" INTEGER NOT NULL,
    "cover_url" TEXT NOT NULL,
    "summary" TEXT,
    "impact_score" INTEGER NOT NULL DEFAULT 50,
    "impact_tier" TEXT NOT NULL DEFAULT 'Notable',
    "links_json" TEXT NOT NULL DEFAULT '{}',
    "subgenres_json" TEXT NOT NULL DEFAULT '[]',
    "mbid" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "genres" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parent_genre_id" INTEGER,
    "color_hex" TEXT DEFAULT '#6366f1',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "genres_parent_genre_id_fkey" FOREIGN KEY ("parent_genre_id") REFERENCES "genres" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "album_genres" (
    "album_id" INTEGER NOT NULL,
    "genre_id" INTEGER NOT NULL,

    PRIMARY KEY ("album_id", "genre_id"),
    CONSTRAINT "album_genres_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "album_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "genre_adjacencies" (
    "genre_id" INTEGER NOT NULL,
    "adjacent_genre_id" INTEGER NOT NULL,

    PRIMARY KEY ("genre_id", "adjacent_genre_id"),
    CONSTRAINT "genre_adjacencies_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "genre_adjacencies_adjacent_genre_id_fkey" FOREIGN KEY ("adjacent_genre_id") REFERENCES "genres" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "genre_hero_albums" (
    "genre_id" INTEGER NOT NULL,
    "album_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("genre_id", "album_id"),
    CONSTRAINT "genre_hero_albums_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "genre_hero_albums_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "genre_canon_albums" (
    "genre_id" INTEGER NOT NULL,
    "album_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("genre_id", "album_id"),
    CONSTRAINT "genre_canon_albums_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "genre_canon_albums_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "image" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_saved_albums" (
    "user_id" TEXT NOT NULL,
    "album_id" INTEGER NOT NULL,
    "saved_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_id", "album_id"),
    CONSTRAINT "user_saved_albums_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_saved_albums_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_rooms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_rooms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_room_albums" (
    "room_id" INTEGER NOT NULL,
    "album_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("room_id", "album_id"),
    CONSTRAINT "user_room_albums_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "user_rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_room_albums_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
