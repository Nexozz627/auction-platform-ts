import "dotenv/config";
import { prisma } from "./src/config/db.js";

async function main() {
  console.log("🧹 [1/4] Wiping existing database records...");

  await prisma.bid.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 [2/4] Provisioning professional test accounts...");
  
  const vendor = await prisma.user.create({
    data: {
      username: "TechVault_Official",
      email: "sales@techvault.com",
      firstName: "Elias",
      lastName: "Retail",
      password: "password123", 
    },
  });

  const trader = await prisma.user.create({
    data: {
      username: "QuantAlpha",
      email: "algo@propfirm.com",
      firstName: "Tarek",
      lastName: "Finance",
      password: "password123",
    },
  });

  console.log("📦 [3/4] Injecting short-term scenarios for Cron testing...");

  // Short-term item 1: Closes in 15 seconds
  const closingSoonItem = await prisma.item.create({
    data: {
      title: "Cisco Catalyst 9000 Network Switch",
      category: "ELECTRONICS",
      description: "Enterprise-grade network routing hardware.",
      createdBy: vendor.id,
      startingPrice: 400,
      currentPrice: 550,
      endTime: new Date(Date.now() + 15 * 1000), 
      status: "ACTIVE",
    },
  });

  const winningBidA = await prisma.bid.create({
    data: {
      userId: trader.id,
      itemId: closingSoonItem.id,
      amount: 550,
      isValid: true,
    },
  });

  await prisma.item.update({
    where: { id: closingSoonItem.id },
    data: { highestBidId: winningBidA.id },
  });

  // Short-term item 2: Closes in 30 seconds (No bids)
  await prisma.item.create({
    data: {
      title: "Polarized Aviator Sunglasses",
      category: "ACCESSORIES",
      description: "Classic polarized lenses with UV protection.",
      createdBy: vendor.id,
      startingPrice: 150,
      currentPrice: 150,
      endTime: new Date(Date.now() + 30 * 1000), 
      status: "ACTIVE",
    },
  });

  console.log("🛍️ [4/4] Generating long-term inventory for UI testing...");

  // Clean, strict-typed bulk insertion using createMany
  await prisma.item.createMany({
    data: [
      {
        title: "Signed 2003 Invincibles Jersey",
        category: "SPORTS_EQUIPMENT",
        description: "Authentic signed memorabilia from the legendary unbeaten season.",
        createdBy: vendor.id,
        startingPrice: 1000,
        currentPrice: 1000,
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        status: "ACTIVE",
      },
      {
        title: "High-Frequency Trading Terminal",
        category: "ELECTRONICS",
        description: "Multi-monitor setup optimized for low-latency market execution.",
        createdBy: vendor.id,
        startingPrice: 3500,
        currentPrice: 3500,
        endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: "ACTIVE",
      },
      {
        title: "Automatic Swiss Dive Watch",
        category: "WATCHES",
        description: "Water resistant up to 300m with a beautiful sapphire crystal.",
        createdBy: vendor.id,
        startingPrice: 2200,
        currentPrice: 2200,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "ACTIVE",
      },
      {
        title: "Vintage Leather Motorcycle Jacket",
        category: "CLOTHING",
        description: "Heavyweight genuine leather jacket from the 1980s.",
        createdBy: vendor.id,
        startingPrice: 250,
        currentPrice: 250,
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        status: "ACTIVE",
      },
      {
        title: "Handcrafted Leather Briefcase",
        category: "ACCESSORIES",
        description: "Premium Italian leather, perfect for professional environments.",
        createdBy: vendor.id,
        startingPrice: 180,
        currentPrice: 180,
        endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        status: "ACTIVE",
      },
      {
        title: "Professional Carbon Fiber Tennis Racket",
        category: "SPORTS_EQUIPMENT",
        description: "Lightweight and powerful, used by top ATP professionals.",
        createdBy: vendor.id,
        startingPrice: 210,
        currentPrice: 210,
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        status: "ACTIVE",
      },
      {
        title: "Noise-Cancelling Studio Headphones",
        category: "ELECTRONICS",
        description: "Over-ear wireless headphones with active noise cancellation.",
        createdBy: vendor.id,
        startingPrice: 300,
        currentPrice: 300,
        endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days
        status: "ACTIVE",
      },
      {
        title: "Minimalist Chronograph",
        category: "WATCHES",
        description: "Sleek black dial with an adjustable mesh strap.",
        createdBy: vendor.id,
        startingPrice: 120,
        currentPrice: 120,
        endTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days
        status: "ACTIVE",
      }
    ],
  });

  console.log("✅ Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Fatal error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });