import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-[#030712]/80 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Token2022 Builder
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Build Your Next-Gen
              <br />
              Solana Token
            </h1>
            <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
              Create customizable Token2022 contracts with advanced features.
              Drag & drop configuration, instant deployment.
            </p>
            <div className="mt-10">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                Start Building →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features for Your Token
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Whale Alert Feature */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors">
              <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Whale Alert</h3>
              <p className="text-gray-400">
                Monitor large transactions and protect your token economy with customizable whale detection.
              </p>
            </div>

            {/* Whitelist Management */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors">
              <div className="h-12 w-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Whitelist Control</h3>
              <p className="text-gray-400">
                Manage authorized addresses with flexible whitelist controls for enhanced security.
              </p>
            </div>

            {/* Transfer Limits */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors">
              <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Transfer Limits</h3>
              <p className="text-gray-400">
                Set and manage transfer limits to maintain healthy token circulation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>Built for Solana Hackathon</p>
        </div>
      </footer>
    </div>
  );
}
