/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external domains if needed
  images: {
    unoptimized: true,
  },
  // Trailing slash for Netlify compatibility
  trailingSlash: false,
};

module.exports = nextConfig;
