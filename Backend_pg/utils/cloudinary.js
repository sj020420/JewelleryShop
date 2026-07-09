const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a local file to Cloudinary.
 * If Cloudinary is not configured, returns null.
 * @param {string} localFilePath 
 * @param {string} folder 
 * @returns {Promise<string|null>} The secure URL or null
 */
async function uploadToCloudinary(localFilePath, folder = 'products') {
  if (!isCloudinaryConfigured) return null;
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: `saj_by_anita/${folder}`,
    });
    // Remove local file after successful upload
    fs.unlink(localFilePath, () => {});
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
}

/**
 * Deletes an image from Cloudinary using its secure URL.
 * @param {string} url 
 * @returns {Promise<void>}
 */
async function deleteFromCloudinary(url) {
  if (!isCloudinaryConfigured || !url || !url.includes('cloudinary.com')) return;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return;
    const publicIdWithVersion = parts[1];
    let publicId = publicIdWithVersion.replace(/^v\d+\//, '');
    publicId = publicId.substring(0, publicId.lastIndexOf('.'));
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
}

module.exports = { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured };
