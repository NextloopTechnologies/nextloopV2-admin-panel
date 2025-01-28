/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port:'',
        pathname: '/nextloop/**'
      }
    ]
  }
};

export default nextConfig;
