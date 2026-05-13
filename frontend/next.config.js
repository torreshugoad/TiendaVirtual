/** @type {import('next').NextConfig} */

const nextConfig = {

  allowedDevOrigins: [

    '192.168.1.8'

  ],

  images: {

    remotePatterns: [

      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      },

      {
        protocol: 'https',
        hostname: 'via.placeholder.com'
      }

    ]

  }

};

module.exports = nextConfig;