/** @type {import('next').NextConfig} */

const nextConfig = {
    env: {
        VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID,
    },
};

export default nextConfig;