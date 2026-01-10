const { processAndUploadImage } = require('../services/imageProcessingService');

/**
 * Handle Single Image Upload
 */
const uploadProductImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        // Process the image
        const imageUrls = await processAndUploadImage(req.file.path);

        res.status(200).json({
            message: "Image uploaded successfully",
            data: imageUrls
        });

    } catch (error) {
        console.error("Upload controller error:", error);
        // Return clear error to user
        res.status(500).json({
            error: "Image upload failed",
            details: error.message
        });
    }
};

module.exports = {
    uploadProductImage
};
