/** @type {import('next').NextConfig} */
const backendBaseUrl =
  process.env.INTERNAL_BACKEND_URL ||
  `http://127.0.0.1:${process.env.BACKEND_PORT || "8001"}`;
const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig = {
  rewrites: async () => {
    return [
      ...(isDevelopment
        ? [
            {
              source: "/api/:path*",
              destination: `${backendBaseUrl}/api/:path*`,
            },
          ]
        : []),
      {
        source: "/docs",
        destination: isDevelopment ? `${backendBaseUrl}/api/docs` : "/api/docs",
      },
      {
        source: "/openapi.json",
        destination: isDevelopment ? `${backendBaseUrl}/api/openapi.json` : "/api/openapi.json",
      },
    ];
  },
};

module.exports = nextConfig;
