import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { genres, adjacencies } from "./data/genres";
import { albums, genreHeroAlbums, genreCanonAlbums } from "./data/albums";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  idleTimeoutMillis: 0, // Disable idle timeout
  connectionTimeoutMillis: 30000,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🎵 Seeding Music Museum database (upsert mode)...\n");

  // 1. Upsert genres
  console.log("Upserting genres...");
  const genreMap = new Map<string, number>(); // slug -> id

  // Parent genres first
  const parentGenres = genres.filter((g) => g.parentSlug === null);
  for (const g of parentGenres) {
    const upserted = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {
        name: g.name,
        description: g.description,
        colorHex: g.colorHex,
      },
      create: {
        name: g.name,
        slug: g.slug,
        description: g.description,
        colorHex: g.colorHex,
      },
    });
    genreMap.set(g.slug, upserted.id);
  }

  // Child genres
  const childGenres = genres.filter((g) => g.parentSlug !== null);
  for (const g of childGenres) {
    const parentId = genreMap.get(g.parentSlug!);
    const upserted = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {
        name: g.name,
        description: g.description,
        colorHex: g.colorHex,
        parentGenreId: parentId,
      },
      create: {
        name: g.name,
        slug: g.slug,
        description: g.description,
        colorHex: g.colorHex,
        parentGenreId: parentId,
      },
    });
    genreMap.set(g.slug, upserted.id);
  }
  console.log(`  ✓ ${genreMap.size} genres upserted`);

  // 2. Upsert adjacencies — clear and recreate (small table, fast)
  console.log("Upserting genre adjacencies...");
  await prisma.genreAdjacency.deleteMany();
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
        // Skip duplicates silently
      }
    }
  }
  console.log(`  ✓ ${adjCount} adjacencies set`);

  // 3. Deduplicate albums — remove duplicates created by year/mbid mismatches in prior seeds.
  //    For each (title, artistName) group with >1 row, keep the row with the most data and delete the rest.
  console.log("Deduplicating albums...");
  const dupes: Array<{ title: string; artist_name: string; cnt: bigint }> =
    await prisma.$queryRaw`
      SELECT title, artist_name, COUNT(*) as cnt
      FROM albums
      GROUP BY title, artist_name
      HAVING COUNT(*) > 1
    `;
  let deduped = 0;
  for (const dup of dupes) {
    const rows = await prisma.album.findMany({
      where: { title: dup.title, artistName: dup.artist_name },
      orderBy: { id: "asc" },
    });
    const best = rows.reduce((a, b) => {
      const scoreA = (a.mbid ? 2 : 0) + (a.coverUrl && !a.coverUrl.includes("placehold") ? 1 : 0);
      const scoreB = (b.mbid ? 2 : 0) + (b.coverUrl && !b.coverUrl.includes("placehold") ? 1 : 0);
      return scoreB > scoreA ? b : a;
    });
    const deleteIds = rows.filter((r) => r.id !== best.id).map((r) => r.id);
    await prisma.album.deleteMany({ where: { id: { in: deleteIds } } });
    deduped += deleteIds.length;
  }
  if (deduped > 0) {
    console.log(`  ✓ Removed ${deduped} duplicate albums (${dupes.length} groups)`);
  } else {
    console.log("  ✓ No duplicates found");
  }

  // 4. Upsert albums
  console.log("Upserting albums...");
  const albumIdMap = new Map<number, number>(); // index -> db id
  let created = 0;
  let updated = 0;

  for (let i = 0; i < albums.length; i++) {
    const a = albums[i];
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

    const albumData = {
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
    };

    let upserted;

    // Find existing record: by mbid first, then exact (title, artist, year), then (title, artist).
    let existing = a.mbid
      ? await prisma.album.findUnique({ where: { mbid: a.mbid } })
      : null;
    if (!existing) {
      existing = await prisma.album.findUnique({
        where: {
          title_artistName_releaseYear: {
            title: a.title,
            artistName: a.artistName,
            releaseYear: a.releaseYear,
          },
        },
      });
    }
    if (!existing) {
      existing = await prisma.album.findFirst({
        where: { title: a.title, artistName: a.artistName },
      });
    }

    if (existing) {
      // Clear mbid on any other row that holds this mbid to avoid unique constraint violation
      if (a.mbid && existing.mbid !== a.mbid) {
        await prisma.album.updateMany({
          where: { mbid: a.mbid, id: { not: existing.id } },
          data: { mbid: null },
        });
      }
      upserted = await prisma.album.update({
        where: { id: existing.id },
        data: {
          mbid: a.mbid || existing.mbid,
          releaseYear: a.releaseYear,
          coverUrl: albumData.coverUrl,
          summary: albumData.summary,
          impactScore: albumData.impactScore,
          impactTier: albumData.impactTier,
          linksJson: albumData.linksJson,
          subgenresJson: albumData.subgenresJson,
        },
      });
    } else {
      upserted = await prisma.album.create({ data: albumData });
    }

    // Track whether this was a create or update
    if (upserted.createdAt.getTime() === upserted.updatedAt.getTime()) {
      created++;
    } else {
      updated++;
    }

    // Re-link genres: delete old, create new
    await prisma.albumGenre.deleteMany({ where: { albumId: upserted.id } });
    if (genreIds.length > 0) {
      await prisma.albumGenre.createMany({
        data: genreIds.map((genreId) => ({
          albumId: upserted.id,
          genreId,
        })),
        skipDuplicates: true,
      });
    }

    albumIdMap.set(i, upserted.id);

    if ((i + 1) % 100 === 0) {
      console.log(`  ... ${i + 1}/${albums.length} albums`);
    }
  }
  console.log(`  ✓ ${albums.length} albums processed (${created} created, ${updated} updated)`);

  // 5. Recreate hero albums (positional, may shift with new scoring)
  console.log("Setting hero albums...");
  await prisma.genreHeroAlbum.deleteMany();
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
        // Skip if already exists
      }
    }
  }
  console.log("  ✓ Hero albums set");

  // 6. Recreate canon albums
  console.log("Setting canon albums...");
  await prisma.genreCanonAlbum.deleteMany();
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
        // Skip if already exists
      }
    }
  }
  console.log("  ✓ Canon albums set");

  // 7. Create GIN index for full-text search (idempotent)
  console.log("Ensuring full-text search index...");
  try {
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS albums_search_idx ON albums
      USING GIN (to_tsvector('english', title || ' ' || artist_name))
    `);
    console.log("  ✓ Full-text search index ready");
  } catch (e) {
    console.warn("  ⚠ Full-text search index creation failed:", e);
  }

  // 8. Upsert admin user (preserve existing password if no ADMIN_PASSWORD env)
  console.log("Ensuring admin user...");
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@musicmuseum.com" },
  });

  if (existingAdmin) {
    if (process.env.ADMIN_PASSWORD) {
      const newHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      await prisma.user.update({
        where: { email: "admin@musicmuseum.com" },
        data: { passwordHash: newHash },
      });
      console.log("  ✓ Admin password updated from ADMIN_PASSWORD env");
    } else {
      console.log("  ✓ Admin user exists (password preserved)");
    }
  } else {
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
  }

  console.log("\n🎉 Seeding complete!");
  console.log(`   Albums: ${albums.length} (${created} new, ${updated} updated)`);
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
