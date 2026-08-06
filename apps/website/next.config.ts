import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/login",
        destination: "https://my.tenaciti.app/login",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "https://my.tenaciti.app/signup",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
