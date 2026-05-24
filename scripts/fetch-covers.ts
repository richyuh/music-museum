import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const albums = await prisma.album.findMany({
    where: { NOT: { coverUrl: { startsWith: "placeholder" } } },
    select: { coverUrl: true },
    take: 40,
    orderBy: { id: "asc" },
  });
  console.log(JSON.stringify(albums.map((a) => a.coverUrl)));
  await prisma.$disconnect();
}
main();
