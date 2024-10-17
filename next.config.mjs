const { withBundleAnalyzer } = require("@next/bundle-analyzer");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

// Enable the bundle analyzer
const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true", // Enable it when ANALYZE environment variable is true
});

module.exports = withBundleAnalyzerConfig(nextConfig);
