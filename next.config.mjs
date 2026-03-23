/** @type {import('next').NextConfig} */
const nextConfig = {
  // Extend static generation timeout for slow network drives
  staticPageGenerationTimeout: 300,
};

export default nextConfig;
