/** @type {import('next').NextConfig} */
const projectRoot = new URL('.', import.meta.url).pathname;
const nextConfig = {
  distDir: process.env.INDRA_TEST === "1" ? ".next-test" : ".next",
  turbopack: { root: decodeURIComponent(projectRoot) },
  outputFileTracingRoot: decodeURIComponent(projectRoot),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig;