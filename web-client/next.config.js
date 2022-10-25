/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")(["@kratercord/common", "@kratercord/desktop-client"]);

const nextConfig = withTM({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["cdn.discordapp.com","storage.googleapis.com"]
  }
});

module.exports = nextConfig;
