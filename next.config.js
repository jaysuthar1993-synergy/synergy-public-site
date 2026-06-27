/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // Static HTML export — no server needed, works on Cloudflare Pages
  images: {
    unoptimized: true,     // Required for static export (no Next.js image optimization server)
  },
  trailingSlash: false,
};

module.exports = nextConfig;
