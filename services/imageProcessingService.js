const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { uploadFileToS3 } = require('./s3Service');

const SIZES = {
    large: { width: 1200, height: 1200 },
    medium: { width: 600, height: 600 },
    small: { width: 300, height: 300 }
};

/**
 * Process image and upload to S3
 * @param {string} localFilePath - Path to the uploaded file on disk
 * @returns {Promise<Object>} - URLs of uploaded images
 */
const processAndUploadImage = async (localFilePath) => {
    const uniqueId = uuidv4();
    const results = {};

    console.log(`[ImageService] Starting processing for file: ${localFilePath}`);

    try {
        // 1. Read file to buffer to avoid Sharp holding a file lock on Windows
        console.log(`[ImageService] Reading file into memory...`);
        const inputBuffer = await fs.promises.readFile(localFilePath);

        // 2. Generate buffers for each size
        console.log(`[ImageService] Generating resized buffers...`);
        const tasks = Object.entries(SIZES).map(async ([sizeName, dimensions]) => {
            console.log(`[ImageService] Resizing to ${sizeName} (${dimensions.width}x${dimensions.height})...`);
            const buffer = await sharp(inputBuffer)
                .resize(dimensions.width, dimensions.height, {
                    fit: 'cover',
                    position: 'center'
                })
                .webp({ quality: 80 })
                .toBuffer();

            return { sizeName, buffer };
        });

        const resizedImages = await Promise.all(tasks);
        console.log(`[ImageService] Resizing complete. Generated ${resizedImages.length} images.`);

        // 3. Upload to S3
        console.log(`[ImageService] Uploading to S3...`);
        const uploadTasks = resizedImages.map(async ({ sizeName, buffer }) => {
            const key = `products/${uniqueId}/${sizeName}.webp`;
            console.log(`[ImageService] Uploading ${sizeName} to ${key}`);
            const url = await uploadFileToS3(buffer, key, 'image/webp');
            results[sizeName] = url;
            return url;
        });

        await Promise.all(uploadTasks);
        console.log(`[ImageService] S3 Uploads successful.`);

        // 4. Cleanup logic (Only if ALL success)
        try {
            console.log(`[ImageService] Deleting local file: ${localFilePath}`);
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
                console.log(`[ImageService] Local file deleted successfully.`);
            }
        } catch (cleanupError) {
            console.error("[ImageService] Failed to delete local file:", cleanupError);
            // We don't throw here because usage succeeded, just cleanup failed.
        }

        return results;

    } catch (error) {
        // If S3 upload fails (throws after RETRIES), we land here.
        console.error("[ImageService] Image processing pipeline failed:", error);
        throw error;
    }
};

module.exports = {
    processAndUploadImage
};
