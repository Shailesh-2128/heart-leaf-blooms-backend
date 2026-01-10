const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning Database...");

    // Delete in reverse order of dependency to avoid foreign key constraints

    // 1. Delete dependent data of Products
    console.log("Deleting Images...");
    await prisma.image.deleteMany();

    console.log("Deleting Cart Items...");
    await prisma.cart.deleteMany();

    console.log("Deleting Wishlist Items...");
    await prisma.wishlist.deleteMany();

    console.log("Deleting Order Items...");
    await prisma.orderItem.deleteMany();

    // 2. Delete Products (now safe to delete as children are gone)
    console.log("Deleting Products...");
    await prisma.product.deleteMany();

    // 3. Delete dependent data of Vendors (that hasn't been deleted yet)
    console.log("Deleting Commissions...");
    await prisma.commission.deleteMany();

    // Payments might reference Orders or Vendors. 
    // If we only want to clear vendor-related data, we might be careful, 
    // but usually in a clean-up we wipe payments too or filter by vendor_id not null.
    // For simplicity in this dev request, we'll wipe vendor-linked payments.
    console.log("Deleting Vendor Payments...");
    await prisma.payment.deleteMany({
        where: {
            vendor_id: { not: null }
        }
    });

    // 4. Delete Vendors
    console.log("Deleting Vendors...");
    await prisma.vendor.deleteMany();

    console.log("Database cleaned of Vendors and Products.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
