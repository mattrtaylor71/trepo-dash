/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove standalone output for Amplify compatibility
  // Amplify will handle the build output
}

module.exports = nextConfig

