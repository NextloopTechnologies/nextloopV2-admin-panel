/** @type {import('next').NextConfig} */
// const nextConfig = {};
const nextConfig = {
  images: {
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
