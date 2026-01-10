const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

// A list of common plant names to pick from
const productNames = [
    "Peace Lily", "Snake Plant", "Spider Plant", "Aloe Vera", "Fiddle Leaf Fig",
    "Rubber Plant", "Monstera Deliciosa", "Pothos", "ZZ Plant", "Bird of Paradise",
    "Lavender", "Rosemary", "Basil", "Mint", "Thyme",
    "Orchid", "Rose Bush", "Tulip Bulb", "Sunflower Seeds", "Daffodil",
    "Cactus Mini", "Succulent Mix", "Jade Plant", "Bamboo Palm", "Fern Boston"
];

// Images provided by user (Pexels)
const plantImages = [
    "https://images.pexels.com/photos/1974508/pexels-photo-1974508.jpeg",
    "https://images.pexels.com/photos/1048035/pexels-photo-1048035.jpeg",
    "https://images.pexels.com/photos/1201798/pexels-photo-1201798.jpeg",
    "https://images.pexels.com/photos/4505469/pexels-photo-4505469.jpeg",
    "https://images.pexels.com/photos/1424672/pexels-photo-1424672.jpeg",
    "https://images.pexels.com/photos/2922353/pexels-photo-2922353.jpeg",
    "https://images.pexels.com/photos/4505144/pexels-photo-4505144.jpeg"
];

async function main() {
    console.log("Starting Single Vendor Seeding with Pexels Images...");

    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
        console.error("No categories found. Please run valid seeding first.");
        process.exit(1);
    }

    let superVendor = await prisma.vendor.findFirst({
        where: { shopName: "Super Plant Store" }
    });

    if (!superVendor) {
        console.log("Creating Super Plant Store vendor...");
        const passwordHash = "hashed_password_placeholder";
        superVendor = await prisma.vendor.create({
            data: {
                id: uuidv4(),
                name: "Super Vendor Owner",
                email: "super.vendor@example.com",
                password: passwordHash,
                shopName: "Super Plant Store",
                shopAddress: "1 Best Plant Street, Green City",
                shopDescription: "The ultimate collection of plants from all categories.",
                bankName: "Green Bank",
                accountNumber: "9999999999",
                IFSC: "GRN0001",
                isFeatured: true,
                isVerified: true,
                status: "approved"
            }
        });
    }

    console.log(`Using Vendor: ${superVendor.shopName} (${superVendor.id})`);

    const totalProducts = 25;

    for (let i = 0; i < totalProducts; i++) {
        const randomCategory = categories[i % categories.length];
        const randomName = productNames[i % productNames.length];
        const productId = uuidv4();
        const price = (Math.random() * 80 + 20).toFixed(2);

        // Use consistent reliable images
        const imageUrl = plantImages[i % plantImages.length];

        console.log(`Creating product ${i + 1}/${totalProducts}: ${randomName} in ${randomCategory.category_name}`);

        await prisma.product.create({
            data: {
                product_id: productId,
                vendor_id: superVendor.id,
                category_id: randomCategory.category_id,
                product_name: randomName,
                product_title: `Premium ${randomName}`,
                product_description: `This ${randomName} is one of our finest selections.`,
                product_price: parseFloat(price),
                discount_price: parseFloat((price * 0.9).toFixed(2)),
                product_guide: "Water regularly, keep in indirect sunlight.",
                is_available: true,
                images: {
                    create: [
                        {
                            large_url: imageUrl,
                            medium_url: imageUrl,
                            small_url: imageUrl
                        }
                    ]
                }
            }
        });
    }

    console.log(`Successfully seeded ${totalProducts} products for vendor '${superVendor.shopName}'.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
