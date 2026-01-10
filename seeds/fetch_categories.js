const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
    console.log("Fetching Categories...");

    const categories = await prisma.category.findMany({
        select: {
            category_id: true,
            category_name: true
        }
    });

    if (categories.length === 0) {
        console.log("No categories found in the database.");
    } else {
        console.log(`Found ${categories.length} categories.`);
    }

    let mdContent = "# Categories List\n\n| ID | Name |\n| :--- | :--- |\n";

    categories.forEach(cat => {
        mdContent += `| ${cat.category_id} | ${cat.category_name} |\n`;
    });

    // Write to absolute path to be safe
    const path = require('path');
    const outputPath = path.join(__dirname, '../categories_list.md');

    fs.writeFileSync(outputPath, mdContent);
    console.log(`Successfully saved categories to '${outputPath}'`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
