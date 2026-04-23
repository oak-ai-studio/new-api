/** @type {import('next').NextConfig} */
const backendBaseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://127.0.0.1:3000"

const nextConfig = {
  async rewrites() {
    return [
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
