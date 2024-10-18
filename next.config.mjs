const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add these for better performance in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  poweredByHeader: false,
};

export default nextConfig;
