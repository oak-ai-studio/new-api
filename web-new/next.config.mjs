/** @type {import('next').NextConfig} */
const backendBaseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://127.0.0.1:3000"

const nextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      // Normalize endpoints that may be sensitive to trailing slash
      // differences on different backend versions.
      {
        source: "/api/channel",
        destination: `${backendBaseUrl}/api/channel/`,
      },
      {
        source: "/api/token",
        destination: `${backendBaseUrl}/api/token/`,
      },
      {
        source: "/api/user",
        destination: `${backendBaseUrl}/api/user/`,
      },
      {
        source: "/api/log",
        destination: `${backendBaseUrl}/api/log/`,
      },
      {
        source: "/api/vendors",
        destination: `${backendBaseUrl}/api/vendors/`,
      },
      {
        source: "/api/models",
        destination: `${backendBaseUrl}/api/models/`,
      },
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/api/:path*`,
      },
      {
        source: "/v1/:path*",
        destination: `${backendBaseUrl}/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
