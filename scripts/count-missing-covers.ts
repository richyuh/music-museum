import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const total = await prisma.album.count();
  const placehold = await prisma.album.findMany({
    where: { coverUrl: { contains: "placehold" } },
    select: { id: true, title: true, artistName: true, coverUrl: true },
  });
  const nonItunes = await prisma.album.findMany({
    where: { NOT: { coverUrl: { contains: "mzstatic" } } },
    select: { id: true, title: true, artistName: true, coverUrl: true },
    take: 20,
  });
  console.log(`Total albums: ${total}`);
  console.log(`\nPlacehold.co URLs: ${placehold.length}`);
  placehold.slice(0, 10).forEach((a) => console.log(`  - [${a.id}] ${a.title} by ${a.artistName} → ${a.coverUrl?.slice(0, 60)}`));
  console.log(`\nNon-iTunes covers (first 20):`);
  nonItunes.forEach((a) => console.log(`  - [${a.id}] ${a.title} by ${a.artistName} → ${a.coverUrl?.slice(0, 80)}`));
  await prisma.$disconnect();
}
main();
