// server/services/uploadService.js
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
}

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Multer memory storage holds the 2MB buffer in memory before streaming or writing
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(file.mimetype) && allowed.test(ext)) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  },
});

/**
 * Builds the canonical public URL for an issue image.
 * If the image is already a full HTTPS/HTTP URL (e.g., Cloudinary), returns it as-is.
 * If it is a local filename, prefixes it with `${host}/uploads/${image}`.
 */
function buildImageUrl(image, host) {
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  return `${host}/uploads/${image}`;
}

/**
 * Uploads an image buffer to Cloudinary (in production or if configured),
 * or falls back to local disk storage in development.
 *
 * @param {Express.Multer.File} file - Multer file object with buffer
 * @returns {Promise<{ url: string, isCloud: boolean }>}
 */
async function uploadImage(file) {
  if (!file || !file.buffer) {
    throw new Error('No image file buffer provided for upload');
  }

  const isProd = process.env.NODE_ENV === 'production';

  // 1. If Cloudinary credentials are provided, stream to Cloudinary
  if (isCloudinaryConfigured()) {
    // Re-verify config in case env changed
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'civic-sense/issues',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error.message);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          resolve({
            url: result.secure_url,
            isCloud: true,
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // 2. Production guard: reject upload if cloud storage is unconfigured
  if (isProd) {
    throw new Error(
      'Image uploads cannot be persisted: Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing in production.'
    );
  }

  // 3. Local Development Fallback: write to local server/uploads/
  const safeExt = path.extname(file.originalname).toLowerCase() || '.jpg';
  const filename = `${Date.now()}${safeExt}`;
  const targetPath = path.join(uploadsDir, filename);

  await fs.promises.writeFile(targetPath, file.buffer);
  return {
    url: filename,
    isCloud: false,
  };
}

module.exports = {
  upload,
  uploadImage,
  buildImageUrl,
  isCloudinaryConfigured,
};
