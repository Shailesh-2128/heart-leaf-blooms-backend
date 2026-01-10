const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3 = new S3Client({
    region: process.env.AWS_S3_REGION_NAME,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const MAX_RETRIES = 3;

/**
 * Upload a file to S3 with retry logic.
 * @param {Buffer} buffer - File buffer
 * @param {string} key - S3 Key
 * @param {string} contentType - Mime type
 */
const uploadFileToS3 = async (buffer, key, contentType) => {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
        try {
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: contentType
            });

            await s3.send(command);

            // Construct the URL (Assuming standard S3 URL structure)
            // Or usually: https://<bucket>.s3.<region>.amazonaws.com/<key>
            const url = `https://${process.env.AWS_STORAGE_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION_NAME}.amazonaws.com/${key}`;
            return url;

        } catch (error) {
            attempt++;
            console.error(`S3 Upload Attempt ${attempt} failed for ${key}:`, error.message);
            if (attempt >= MAX_RETRIES) {
                throw new Error(`Failed to upload ${key} after ${MAX_RETRIES} attempts: ${error.message}`);
            }
            // Optional: wait a bit before retry? The prompt doesn't strictly say wait, just "Retry automatically".
            // I'll add a small delay to be safe/polite.
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

module.exports = {
    uploadFileToS3
};
