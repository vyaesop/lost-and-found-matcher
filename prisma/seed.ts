import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Dates are relative to today so match scores stay meaningful over time.
function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

const reports = [
  // Strong pair: the AirPods case scenario
  {
    type: "lost",
    title: "Black AirPods case",
    category: "electronics",
    description: "I lost my black AirPods case near the cafeteria. Small scratch on the lid.",
    color: "black",
    location: "cafeteria",
    date: daysAgo(5),
    timePeriod: "afternoon",
  },
  {
    type: "found",
    title: "Wireless earbud case",
    category: "electronics",
    description: "Found a dark wireless earbud case beside the coffee shop counter.",
    color: "black",
    location: "coffee shop",
    date: daysAgo(5),
    timePeriod: "evening",
  },
  // Strong pair plus an ambiguous one: the backpack scenario
  {
    type: "lost",
    title: "Black backpack",
    category: "bags",
    description: "Black backpack containing a laptop charger and a math textbook.",
    color: "black",
    location: "library",
    date: daysAgo(16),
    timePeriod: "afternoon",
  },
  {
    type: "found",
    title: "Dark backpack",
    category: "bags",
    description: "Dark colored backpack found near the library entrance.",
    color: "black",
    location: "library entrance",
    date: daysAgo(16),
    timePeriod: "evening",
  },
  {
    type: "found",
    title: "Black backpack",
    category: "bags",
    description: "Black backpack found at the football field bleachers.",
    color: "black",
    location: "football field",
    date: daysAgo(2),
    timePeriod: "evening",
  },
  // Moderate pair: same place, colors disagree, sparse description
  {
    type: "lost",
    title: "Brown leather wallet",
    category: "wallets",
    description: "Leather wallet with my student ID and a bus pass inside.",
    color: "brown",
    location: "student center",
    date: daysAgo(4),
    timePeriod: "morning",
  },
  {
    type: "found",
    title: "Dark wallet",
    category: "wallets",
    description: "Found a wallet on a bench, a few cards inside.",
    color: "gray",
    location: "student center",
    date: daysAgo(3),
    timePeriod: "afternoon",
  },
  // Weak cross-match against the AirPods case
  {
    type: "found",
    title: "Phone charger",
    category: "electronics",
    description: "White phone charger with a long cable.",
    color: "white",
    location: "lecture hall 3",
    date: daysAgo(1),
    timePeriod: "morning",
  },
  // Clear non-matches, so some reports show an empty state
  {
    type: "lost",
    title: "Silver water bottle",
    category: "other",
    description: "Steel water bottle with a dented base.",
    color: "silver",
    location: "gym",
    date: daysAgo(6),
    timePeriod: "morning",
  },
  {
    type: "found",
    title: "Red umbrella",
    category: "other",
    description: "Compact red umbrella left at the bus stop.",
    color: "red",
    location: "bus stop on campus",
    date: daysAgo(2),
    timePeriod: "afternoon",
  },
];

async function main() {
  await prisma.report.deleteMany();
  await prisma.report.createMany({ data: reports });
  console.log(`Seeded ${reports.length} reports`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
