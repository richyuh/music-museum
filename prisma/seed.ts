import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { genres, adjacencies } from "./data/genres";
import { albums, genreHeroAlbums, genreCanonAlbums } from "./data/albums";

import path from "path";
const dbPath = "file:" + path.join(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🎵 Seeding Music Museum database...\n");

  // Clean existing data
  console.log("Cleaning existing data...");
  await prisma.userRoomAlbum.deleteMany();
  await prisma.userRoom.deleteMany();
  await prisma.userSavedAlbum.deleteMany();
  await prisma.genreCanonAlbum.deleteMany();
  await prisma.genreHeroAlbum.deleteMany();
  await prisma.genreAdjacency.deleteMany();
  await prisma.albumGenre.deleteMany();
  await prisma.album.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  // Drop FTS if exists
  try {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS albums_fts`);
  } catch {
    // ignore
  }

  // 1. Seed genres
  console.log("Seeding genres...");
  const genreMap = new Map<string, number>(); // slug -> id

  // Insert parent genres first
  const parentGenres = genres.filter((g) => g.parentSlug === null);
  for (const g of parentGenres) {
    const created = await prisma.genre.create({
      data: {
        name: g.name,
        slug: g.slug,
        description: g.description,
        colorHex: g.colorHex,
      },
    });
    genreMap.set(g.slug, created.id);
  }

  // Insert child genres
  const childGenres = genres.filter((g) => g.parentSlug !== null);
  for (const g of childGenres) {
    const parentId = genreMap.get(g.parentSlug!);
    const created = await prisma.genre.create({
      data: {
        name: g.name,
        slug: g.slug,
        description: g.description,
        colorHex: g.colorHex,
        parentGenreId: parentId,
      },
    });
    genreMap.set(g.slug, created.id);
  }
  console.log(`  ✓ ${genreMap.size} genres created`);

  // 2. Seed adjacencies
  console.log("Seeding genre adjacencies...");
  let adjCount = 0;
  for (const adj of adjacencies) {
    const genreId = genreMap.get(adj.genreSlug);
    const adjacentId = genreMap.get(adj.adjacentSlug);
    if (genreId && adjacentId) {
      try {
        await prisma.genreAdjacency.create({
          data: { genreId, adjacentGenreId: adjacentId },
        });
        adjCount++;
      } catch {
        // Duplicate, skip
      }
    }
  }
  console.log(`  ✓ ${adjCount} adjacencies created`);

  // 3. Seed albums
  console.log("Seeding albums...");
  const albumIdMap = new Map<number, number>(); // index -> db id

  for (let i = 0; i < albums.length; i++) {
    const a = albums[i];
    // Resolve genre IDs
    const genreIds = a.genres
      .map((slug) => genreMap.get(slug))
      .filter((id): id is number => id !== undefined);

    // Generate cover placeholder URL based on genre color
    const firstGenre = genres.find((g) => g.slug === a.genres[0]);
    const color = (firstGenre?.colorHex || "#6366f1").replace("#", "");
    const coverUrl = `https://placehold.co/600x600/${color}/ffffff?text=${encodeURIComponent(a.title.substring(0, 30))}&font=montserrat`;

    const created = await prisma.album.create({
      data: {
        title: a.title,
        artistName: a.artistName,
        releaseYear: a.releaseYear,
        coverUrl,
        summary: a.summary,
        impactScore: a.impactScore,
        impactTier: a.impactTier,
        linksJson: JSON.stringify(a.links),
        subgenresJson: JSON.stringify(a.subgenres),
        genres: {
          create: genreIds.map((genreId) => ({
            genre: { connect: { id: genreId } },
          })),
        },
      },
    });
    albumIdMap.set(i, created.id);

    if ((i + 1) % 100 === 0) {
      console.log(`  ... ${i + 1}/${albums.length} albums`);
    }
  }
  console.log(`  ✓ ${albums.length} albums created`);

  // 4. Seed hero albums (Start Here)
  console.log("Seeding hero albums...");
  for (const [genreSlug, albumIndices] of Object.entries(genreHeroAlbums)) {
    const genreId = genreMap.get(genreSlug);
    if (!genreId) continue;

    for (let pos = 0; pos < albumIndices.length; pos++) {
      const albumId = albumIdMap.get(albumIndices[pos]);
      if (!albumId) continue;
      try {
        await prisma.genreHeroAlbum.create({
          data: { genreId, albumId, position: pos },
        });
      } catch {
        // Skip duplicates
      }
    }
  }
  console.log("  ✓ Hero albums set");

  // 5. Seed canon albums
  console.log("Seeding canon albums...");
  for (const [genreSlug, albumIndices] of Object.entries(genreCanonAlbums)) {
    const genreId = genreMap.get(genreSlug);
    if (!genreId) continue;

    for (let pos = 0; pos < albumIndices.length; pos++) {
      const albumId = albumIdMap.get(albumIndices[pos]);
      if (!albumId) continue;
      try {
        await prisma.genreCanonAlbum.create({
          data: { genreId, albumId, position: pos },
        });
      } catch {
        // Skip duplicates
      }
    }
  }
  console.log("  ✓ Canon albums set");

  // 6. Create FTS5 virtual table
  console.log("Creating FTS5 search index...");
  try {
    await prisma.$executeRawUnsafe(`
      CREATE VIRTUAL TABLE IF NOT EXISTS albums_fts USING fts5(
        title, artist_name,
        content='albums',
        content_rowid='id',
        tokenize='porter unicode61'
      )
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO albums_fts(rowid, title, artist_name)
      SELECT id, title, artist_name FROM albums
    `);

    // Auto-sync triggers
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER IF NOT EXISTS albums_fts_ai AFTER INSERT ON albums BEGIN
        INSERT INTO albums_fts(rowid, title, artist_name) VALUES (new.id, new.title, new.artist_name);
      END
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER IF NOT EXISTS albums_fts_ad AFTER DELETE ON albums BEGIN
        INSERT INTO albums_fts(albums_fts, rowid, title, artist_name) VALUES('delete', old.id, old.title, old.artist_name);
      END
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER IF NOT EXISTS albums_fts_au AFTER UPDATE ON albums BEGIN
        INSERT INTO albums_fts(albums_fts, rowid, title, artist_name) VALUES('delete', old.id, old.title, old.artist_name);
        INSERT INTO albums_fts(rowid, title, artist_name) VALUES (new.id, new.title, new.artist_name);
      END
    `);
    console.log("  ✓ FTS5 index created");
  } catch (e) {
    console.warn("  ⚠ FTS5 creation failed (may not be available):", e);
  }

  // 7. Create admin user
  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      email: "admin@musicmuseum.com",
      passwordHash: adminPassword,
      name: "Admin",
      role: "admin",
    },
  });
  console.log("  ✓ Admin user created (admin@musicmuseum.com / admin123)");

  console.log("\n🎉 Seeding complete!");
  console.log(`   Albums: ${albums.length}`);
  console.log(`   Genres: ${genreMap.size}`);
  console.log(`   Adjacencies: ${adjCount}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
