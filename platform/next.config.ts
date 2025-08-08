import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    
    // Enable WebAssembly support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    
    // Add WASM file handling
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    })
    
    // Add fallbacks for server-side rendering
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }
    
    // Handle WASM files specifically
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    
    return config
  },
  // Disable static optimization for pages that use WASM
  experimental: {
    esmExternals: 'loose',
  }
};

export default nextConfig;
