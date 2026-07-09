/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/setlists',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
