const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

async function main() {
    console.log("Seeding Products with Real Vendor/Category IDs...");

    // 1. Fetch existing Categories and Vendors from DB
    const categories = await prisma.category.findMany();
    const vendors = await prisma.vendor.findMany();

    if (categories.length === 0 || vendors.length === 0) {
        console.error("Error: No categories or vendors found. Please run 'npm run seed:cv' first.");
        process.exit(1);
    }

    console.log(`Found ${categories.length} categories and ${vendors.length} vendors in database.`);

    const productNames = [
        "Peace Lily", "Snake Plant", "Spider Plant", "Aloe Vera", "Fiddle Leaf Fig",
        "Rubber Plant", "Monstera Deliciosa", "Pothos", "ZZ Plant", "Bird of Paradise",
        "Lavender", "Rosemary", "Basil", "Mint", "Thyme",
        "Orchid", "Rose Bush", "Tulip Bulb", "Sunflower Seeds", "Daffodil",
        "Cactus Mini", "Succulent Mix", "Jade Plant", "Bamboo Palm", "Fern Boston"
    ];

    // High-quality Pexels images (Verified Links)
    const plantImages = [
        "https://images.pexels.com/photos/1974508/pexels-photo-1974508.jpeg",
        "https://images.pexels.com/photos/1048035/pexels-photo-1048035.jpeg",
        "https://images.pexels.com/photos/1201798/pexels-photo-1201798.jpeg",
        "https://images.pexels.com/photos/4505469/pexels-photo-4505469.jpeg",
        "https://images.pexels.com/photos/1424672/pexels-photo-1424672.jpeg",
        "https://images.pexels.com/photos/2922353/pexels-photo-2922353.jpeg",
        "https://images.pexels.com/photos/4505144/pexels-photo-4505144.jpeg"
    ];

    let createdCount = 0;

    // Strategy: Ensure EVERY vendor has at least 3 products
    // And distribute them across ALL categories

    for (const vendor of vendors) {
        // Create 3 products per vendor
        for (let i = 0; i < 3; i++) {
            // Cycle through categories to ensure diversity
            // Use global counter 'createdCount' to step through arrays evenly
            const randomCategory = categories[createdCount % categories.length];
            const randomName = productNames[createdCount % productNames.length];
            const imageUrl = plantImages[createdCount % plantImages.length];

            const productId = uuidv4();
            // Price between 20 and 150
            const price = (Math.random() * 130 + 20).toFixed(2);

            await prisma.product.create({
                data: {
                    product_id: productId,
                    vendor_id: vendor.id, // Using REAL vendor ID from DB
                    category_id: randomCategory.category_id, // Using REAL category ID from DB
                    product_name: randomName,
                    product_title: `Premium ${randomName} from ${vendor.shopName}`,
                    product_description: `A wonderful ${randomName} grown with care by ${vendor.shopName}. Perfect for your collection.`,
                    product_price: parseFloat(price),
                    discount_price: parseFloat((price * 0.85).toFixed(2)), // 15% discount
                    product_guide: "Water when top inch of soil is dry. Needs bright, indirect light.",
                    is_available: true,
                    images: {
                        create: [
                            {
                                large_url: imageUrl,
                                medium_url: imageUrl, // Pexels supports auto-scaling usually but using raw for now
                                small_url: imageUrl
                            }
                        ]
                    }
                }
            });

            createdCount++;
            process.stdout.write("."); // Progress indicator
        }
    }

    console.log(`\nSuccessfully seeded ${createdCount} products.`);
    console.log("Every vendor now has at least 3 products.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
