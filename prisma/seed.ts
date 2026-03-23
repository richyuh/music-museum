import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { genres, adjacencies } from "./data/genres";
import { albums, genreHeroAlbums, genreCanonAlbums } from "./data/albums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
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
      } catch (e) {
        console.warn(`Warning: Failed to create adjacency ${adj.genreSlug} -> ${adj.adjacentSlug}:`, e);
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

    // Use baked cover URL if available, otherwise generate placeholder
    let coverUrl = a.coverUrl;
    if (!coverUrl) {
      const firstGenre = genres.find((g) => g.slug === a.genres[0]);
      const color = (firstGenre?.colorHex || "#6366f1").replace("#", "");
      coverUrl = `https://placehold.co/600x600/${color}/ffffff?text=${encodeURIComponent(a.title.substring(0, 30))}&font=montserrat`;
    }

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
        mbid: a.mbid || null,
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
      } catch (e) {
        console.warn(`Warning: Failed to create hero album for ${genreSlug}:`, e);
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
      } catch (e) {
        console.warn(`Warning: Failed to create canon album for ${genreSlug}:`, e);
      }
    }
  }
  console.log("  ✓ Canon albums set");

  // 6. Create GIN index for full-text search
  console.log("Creating full-text search index...");
  try {
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS albums_search_idx ON albums
      USING GIN (to_tsvector('english', title || ' ' || artist_name))
    `);
    console.log("  ✓ Full-text search index created");
  } catch (e) {
    console.warn("  ⚠ Full-text search index creation failed:", e);
  }

  // 7. Create admin user
  console.log("Creating admin user...");
  const rawPassword = process.env.ADMIN_PASSWORD || crypto.randomUUID();
  const adminPassword = await bcrypt.hash(rawPassword, 12);
  await prisma.user.create({
    data: {
      email: "admin@musicmuseum.com",
      passwordHash: adminPassword,
      name: "Admin",
      role: "admin",
    },
  });
  if (process.env.ADMIN_PASSWORD) {
    console.log("  ✓ Admin user created (admin@musicmuseum.com / <from ADMIN_PASSWORD env>)");
  } else {
    console.log(`  ✓ Admin user created (admin@musicmuseum.com / ${rawPassword})`);
  }

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
