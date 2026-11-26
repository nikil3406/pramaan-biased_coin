import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const trades = [
  {
    name: "Electrician",
    slug: "electrician",
    description: "Electrical installation and maintenance.",
    skills: [
      ["Wiring", "wiring", "Electrical wiring."],
      ["Switch Installation", "switch-installation", "Switch and socket installation."],
      ["Circuit Troubleshooting", "circuit-troubleshooting", "Diagnosing electrical circuit faults."],
      ["House Wiring", "house-wiring", "Residential wiring."],
      ["MCB Installation", "mcb-installation", "Circuit breaker installation."],
      ["Electrical Maintenance", "electrical-maintenance", "Electrical system maintenance."],
      ["Multimeter Usage", "multimeter-usage", "Safe electrical measurement."],
    ],
  },
  {
    name: "Plumber",
    slug: "plumber",
    description: "Pipe installation and plumbing repair.",
    skills: [
      ["Pipe Installation", "pipe-installation", "Installing plumbing pipes."],
      ["Leakage Repair", "leakage-repair", "Finding and repairing leaks."],
      ["Tap Installation", "tap-installation", "Installing taps and fixtures."],
      ["PVC Pipefitting", "pvc-pipefitting", "PVC pipe fitting."],
      ["CPVC Jointing", "cpvc-jointing", "CPVC joint preparation and installation."],
      ["Leak Testing", "leak-testing", "Testing plumbing joints for leaks."],
    ],
  },
  {
    name: "Mason",
    slug: "mason",
    description: "Masonry construction and finishing.",
    skills: [
      ["Brick Laying", "brick-laying", "Laying bricks safely and accurately."],
      ["Plastering", "plastering", "Wall and surface plastering."],
      ["Concrete Work", "concrete-work", "Concrete mixing and placement."],
      ["Floor Levelling", "floor-levelling", "Preparing level flooring surfaces."],
    ],
  },
  {
    name: "Welder",
    slug: "welder",
    description: "Metal fabrication and welding.",
    skills: [
      ["Arc Welding", "arc-welding", "Shielded metal arc welding."],
      ["MIG Welding", "mig-welding", "Metal inert gas welding."],
      ["Metal Fabrication", "metal-fabrication", "Fabricating metal structures."],
      ["Joint Preparation", "joint-preparation", "Preparing safe weld joints."],
    ],
  },
];

async function main() {
  for (const trade of trades) {
    const savedTrade = await prisma.trade.upsert({
      where: { slug: trade.slug },
      update: { name: trade.name, description: trade.description, isActive: true },
      create: { name: trade.name, slug: trade.slug, description: trade.description, isActive: true },
    });

    for (const [name, slug, description] of trade.skills) {
      await prisma.skill.upsert({
        where: { tradeId_slug: { tradeId: savedTrade.id, slug } },
        update: { name, description, isActive: true },
        create: { tradeId: savedTrade.id, name, slug, description, isActive: true },
      });
    }
  }
}

main().finally(async () => prisma.$disconnect());
