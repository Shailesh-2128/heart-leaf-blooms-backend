const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt'); // Ensure bcrypt is available or use existing dependency
const { v4: uuidv4 } = require('uuid');

async function main() {
    console.log("Seeding 20 Categories and 20+ Vendors...");

    // 1. Categories List (20 items)
    const categoryNames = [
        // Original 8
        "Indoor Plants", "Succulents", "Flowering Shrubs", "Herbs",
        "Cacti", "Climbers", "Ferns", "Bonsai",
        // New 12
        "Fruit Trees", "Aromatic Plants", "Medicinal Plants", "Aquatic Plants",
        "Ground Covers", "Hanging Baskets", "Palms", "Orchids",
        "Perennials", "Annuals", "Vegetable Starters", "Rare Tropicals"
    ];

    console.log("Creating Categories...");
    // We use upsert or create to ensure they exist. 
    // Since IDs are autoincrement, we'll just check existences or createMany if empty?
    // User wants "seed 20 categories".
    // I'll iterate and create if not exists.

    for (const name of categoryNames) {
        // Simple check based on name to avoid duplicates if re-seeding without clean
        const exists = await prisma.category.findFirst({ where: { category_name: name } });
        if (!exists) {
            await prisma.category.create({
                data: {
                    category_name: name,
                    category_description: `Everything related to ${name}`,
                    category_icon: "leaf" // Placeholder
                }
            });
        }
    }

    console.log("Categories seeded.");

    // 2. Vendors (20+)
    // User wants at least 20 vendors.

    // We'll create distinct vendors.
    const vendorsToCreate = 25;
    const passwordHash = await bcrypt.hash("password123", 10);

    console.log("Creating Vendors...");

    for (let i = 1; i <= vendorsToCreate; i++) {
        const vendorNum = i;
        const email = `vendor${vendorNum}@example.com`;

        // Check if exists
        const exists = await prisma.vendor.findUnique({ where: { email } });
        if (!exists) {
            // Random user number for image as requested: 1-123 range logic
            // User said: "user number is chnaging 1-123 in betwin user1,user124-user23 like this"
            // I'll pick a random number between 1 and 300 to be safe and diverse.
            const userImageId = Math.floor(Math.random() * 300) + 1;
            const profileImage = `https://i.pravatar.cc/150?u=user${userImageId}`;

            await prisma.vendor.create({
                data: {
                    id: uuidv4(),
                    name: `Vendor Owner ${vendorNum}`,
                    email: email,
                    password: passwordHash,
                    shopName: `Bloom Shop ${vendorNum}`,
                    shopAddress: `${vendorNum} Garden Street, City`,
                    shopDescription: `We provide the best plants (Vendor ${vendorNum}).`,
                    bankName: "Green Bank",
                    accountNumber: `10000000${vendorNum}`,
                    IFSC: "GRNb001",
                    vendorTag: "Verified Seller",
                    isFeatured: i % 5 === 0, // Every 5th is featured
                    isVerified: true,
                    status: "approved",
                    profile_image: profileImage
                }
            });
            console.log(`Created Vendor ${vendorNum} with image ${profileImage}`);
        }
    }

    console.log("Vendors seeded.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
