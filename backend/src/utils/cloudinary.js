const fs = require('fs');
const { cloudinary, isConfigured } = require('../config/cloudinary');

/**
 * Uploads a local file to Cloudinary and deletes the local copy if successful.
 * @param {string} localFilePath - Path to the file on local disk
 * @param {string} folder - Destination folder on Cloudinary (e.g., 'avatars', 'courses')
 * @returns {Promise<string|null>} - Secure URL from Cloudinary if successful, or null to fall back
 */
async function uploadToCloud(localFilePath, folder = 'uploads') {
  if (!isConfigured) {
    return null; // Fallback to local file path
  }

  if (!localFilePath || !fs.existsSync(localFilePath)) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: `quanlytrungtam/${folder}`,
      resource_type: 'auto'
    });

    // Delete local file after successful upload to cloud
    try {
      fs.unlinkSync(localFilePath);
    } catch (err) {
      console.warn(`Could not delete temporary local file: ${localFilePath}`, err);
    }

    return result.secure_url;
  } catch (error) {
    console.error('Failed to upload file to Cloudinary:', error);
    return null; // Fallback to local storage on error
  }
}

module.exports = {
  isConfigured,
  uploadToCloud,
  cloudinary
};
