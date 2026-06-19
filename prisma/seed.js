import { prisma } from "../src/config/db.js";


async function main() {
  console.log("🧹 1. Cleaning up the database...");
  // Order is important because of foreign keys!
  await prisma.bid.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 2. Creating test users...");
  // One item creator and one bidder
  const seller = await prisma.user.create({
    data: {
      username: "seller1",
      email: "seller@test.com",
      firstName: "Karim",
      lastName: "Dev",
      password: "password123", // In your real project, it will be hashed
    },
  });

  const bidder = await prisma.user.create({
    data: {
      username: "SniperDu93",
      email: "sniper@test.com",
      firstName: "Amine",
      lastName: "Bid",
      password: "password123",
    },
  });

  console.log("📦 3. Injecting auction scenarios...");

  // CASE 1 : Expires in 2 seconds WITH an offer (The winning case)
  const itemWithBid = await prisma.item.create({
    data: {
      title: "Gaming PC RTX 4090 (Test with Winner)",
      category: "ELECTRONICS",
      createdBy: seller.id,
      startingPrice: 1500,
      currentPrice: 1700,
      endTime: new Date(Date.now() + 2000), // In 2 seconds!
      status: "ACTIVE",
    },
  });

  // Create the bid for this item
  const topBid = await prisma.bid.create({
    data: {
      userId: bidder.id,
      itemId: itemWithBid.id,
      amount: 1700,
      isValid: true,
    },
  });

  // ⚠️ VERY IMPORTANT: Link this bid as the highest ("highestBidId")
  await prisma.item.update({
    where: { id: itemWithBid.id },
    data: { highestBidId: topBid.id },
  });


  // CASE 2: Expires in 4 seconds WITHOUT ANY OFFER (The "didn't sell" case)
  await prisma.item.create({
    data: {
      title: "Broken Vintage Watch (Test without Offer)",
      category: "WATCHES",
      createdBy: seller.id,
      startingPrice: 50,
      currentPrice: 50,
      endTime: new Date(Date.now() + 4000), // In 4 seconds!
      status: "ACTIVE",
    },
  });


  // CASE 3: Expires in 2 days (The case that should NOT move)
  await prisma.item.create({
    data: {
      title: "iPhone 15 Pro Max (Test Do Not Touch)",
      category: "ELECTRONICS",
      createdBy: seller.id,
      startingPrice: 900,
      currentPrice: 900,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // + 2 days
      status: "ACTIVE",
    },
  });

  console.log("✅ Database ready for testing!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });