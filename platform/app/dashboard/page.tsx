'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Connection, clusterApiUrl, Keypair, Transaction, Signer, SystemProgram, PublicKey } from '@solana/web3.js';
import { TokenService } from '../services/tokenService';
import { AmmService } from '../services/ammService';
import { createInitializeMintInstruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Feature components that can be dragged
const features = [
  {
    id: 'whale-alert',
    title: 'Whale Alert',
    description: 'Monitor large transactions',
    icon: '🐋',
    config: {
      isEnabled: false,
      amount: '1000000'
    }
  },
  {
    id: 'whitelist',
    title: 'Whitelist',
    description: 'Control allowed addresses',
    icon: '✅',
    config: {
      isEnabled: false,
      addresses: []
    }
  },
  {
    id: 'transfer-limit',
    title: 'Transfer Limit',
    description: 'Set maximum transfer amounts',
    icon: '🔒',
    config: {
      isEnabled: false,
      amount: '100000'
    }
  }
];

// Update the connections array
const connections = [
  {
    id: 'orca',
    title: 'Orca Integration',
    description: 'Create Whirlpool with your token',
    icon: '🌊',
    disabled: false
  },
  {
    id: 'meteora',
    title: 'Meteora Integration',
    description: 'Create Dynamic AMM pool (requires whitelisting)',
    icon: '☄️',
    disabled: false,
    requiresWhitelist: true
  }
];

export default function Dashboard() {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    decimals: '9'
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [poolCreationStatus, setPoolCreationStatus] = useState<{
    ammType?: string;
    address?: string;
    message?: string;
  } | null>(null);

  // Update handleCreatePool function
  const handleCreatePool = async (ammType: string, mint: PublicKey) => {
    if (!publicKey || !signTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    if (ammType === 'meteora') {
      const visitMeteora = confirm(
        'Meteora pool creation requires whitelisting. Would you like to visit Meteora to request whitelisting?'
      );
      if (visitMeteora) {
        window.open('https://app.meteora.ag', '_blank');
      }
      return;
    }

    setIsCreatingPool(true);
    try {
      const ammService = new AmmService(connection);
      const result = await ammService.createPool(
        ammType as 'orca' | 'meteora',
        mint,
        1.0, // Initial price, you might want to make this configurable
        publicKey,
        async (tx: Transaction) => signTransaction(tx) as Promise<Transaction>
      );

      setPoolCreationStatus({
        ammType,
        address: result.poolAddress.toString(),
        message: result.message
      });

      alert(`Pool created successfully!\nPool Address: ${result.poolAddress}\n\n${result.message}`);
    } catch (error) {
      console.error('Error creating pool:', error);
      alert('Failed to create pool. Please try again.');
    } finally {
      setIsCreatingPool(false);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDrop = (type: 'features' | 'connections') => {
    if (!draggedItem) return;

    if (type === 'features') {
      if (!activeFeatures.includes(draggedItem)) {
        setActiveFeatures([...activeFeatures, draggedItem]);
      }
    } else {
      if (!activeConnections.includes(draggedItem)) {
        setActiveConnections([...activeConnections, draggedItem]);
      }
    }
    setDraggedItem(null);
  };

  // Update the handleDeploy function
  const handleDeploy = useCallback(async () => {
    if (!connected || !publicKey || !signTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    if (!tokenMetadata.name || !tokenMetadata.symbol || !tokenMetadata.totalSupply) {
      alert('Please fill in all token metadata fields');
      return;
    }

    setIsDeploying(true);
    try {
      // Create the token mint
      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const mintTx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          parseInt(tokenMetadata.decimals),
          publicKey,
          publicKey
        )
      );

      mintTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      mintTx.feePayer = publicKey;
      
      const signedMintTx = await signTransaction(mintTx);
      signedMintTx.partialSign(mintKeypair);
      const mintSig = await connection.sendRawTransaction(signedMintTx.serialize());
      await connection.confirmTransaction(mintSig, 'confirmed');

      const tokenService = new TokenService(connection);

      // Prepare feature configuration
      const featureConfig = {
        whaleAlert: activeFeatures.includes('whale-alert')
          ? {
              isEnabled: true,
              amount: features.find(f => f.id === 'whale-alert')?.config.amount || '1000000'
            }
          : undefined,
        whitelist: activeFeatures.includes('whitelist')
          ? {
              isEnabled: true,
              addresses: []
            }
          : undefined,
        transferLimit: activeFeatures.includes('transfer-limit')
          ? {
              isEnabled: true,
              amount: features.find(f => f.id === 'transfer-limit')?.config.amount || '100000'
            }
          : undefined
      };

      // Create and send transaction
      const configTx = await tokenService.deployToken(
        tokenMetadata,
        featureConfig,
        publicKey,
        mintKeypair.publicKey
      );

      configTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      configTx.feePayer = publicKey;
      
      const signedConfigTx = await signTransaction(configTx);
      const configSig = await connection.sendRawTransaction(signedConfigTx.serialize());
      await connection.confirmTransaction(configSig, 'confirmed');

      alert(`Token deployed successfully!\nMint address: ${mintKeypair.publicKey.toBase58()}`);

      // After successful token deployment, create pools for active connections
      if (activeConnections.length > 0) {
        for (const connectionId of activeConnections) {
          await handleCreatePool(connectionId, mintKeypair.publicKey);
        }
      }
    } catch (error) {
      console.error('Error deploying token:', error);
      alert('Error deploying token. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  }, [
    connected,
    publicKey,
    signTransaction,
    connection,
    tokenMetadata,
    activeFeatures,
    activeConnections, // Added activeConnections to dependencies
    features,
    handleCreatePool // Added handleCreatePool to dependencies
  ]);

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-[#030712]/80 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Token2022 Builder
            </Link>
            <WalletMultiButton />
          </div>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Configure Your Token</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Available Features & Connections */}
            <div className="space-y-8">
              {/* Features Section */}
              <div className="bg-gray-800/30 rounded-xl p-6 h-[400px] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Available Features</h2>
                <div className="space-y-4">
                  {features.map(feature => (
                    <div
                      key={feature.id}
                      draggable
                      onDragStart={() => handleDragStart(feature.id)}
                      className={`bg-gray-700/50 p-4 rounded-lg cursor-move border-2 ${
                        activeFeatures.includes(feature.id) ? 'border-purple-500/50' : 'border-transparent'
                      } hover:border-purple-500/30 transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{feature.icon}</span>
                        <div>
                          <h3 className="font-medium">{feature.title}</h3>
                          <p className="text-sm text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Available Connections</h2>
                  <div className="space-y-4">
                    {connections.map(connection => (
                      <div
                        key={connection.id}
                        className={`bg-gray-700/50 p-4 rounded-lg border-2 border-transparent ${
                          connection.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-move hover:border-purple-500/30'
                        } transition-colors`}
                        {...(!connection.disabled && {
                          draggable: true,
                          onDragStart: () => handleDragStart(connection.id)
                        })}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{connection.icon}</span>
                          <div>
                            <h3 className="font-medium">{connection.title}</h3>
                            <p className="text-sm text-gray-400">{connection.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Configuration Area */}
            <div className="space-y-8">
              {/* Unified Drop Zone */}
              <div className="bg-gray-800/30 rounded-xl p-6 h-[400px] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Token Configuration</h2>
                <div 
                  className="min-h-[300px] border-2 border-dashed border-gray-700 rounded-lg p-4"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedItem?.includes('orca') || draggedItem?.includes('meteora')) {
                      handleDrop('connections');
                    } else {
                      handleDrop('features');
                    }
                  }}
                >
                  {activeFeatures.length === 0 && activeConnections.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Drag features here to configure your token
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Active Features */}
                      {activeFeatures.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-purple-400">Active Features</h3>
                          {activeFeatures.map(id => {
                            const feature = features.find(f => f.id === id);
                            if (!feature) return null;
                            return (
                              <div key={id} className="bg-gray-700/50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl">{feature.icon}</span>
                                    <h3 className="font-medium">{feature.title}</h3>
                                  </div>
                                  <button
                                    onClick={() => setActiveFeatures(activeFeatures.filter(f => f !== id))}
                                    className="text-gray-400 hover:text-red-400"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {Object.entries(feature.config).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                      <label className="text-sm text-gray-400 capitalize">{key}:</label>
                                      {typeof value === 'boolean' ? (
                                        <input type="checkbox" className="form-checkbox" />
                                      ) : (
                                        <input
                                          type="text"
                                          defaultValue={value}
                                          className="bg-gray-900 rounded px-2 py-1 text-sm w-full"
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Active Connections */}
                      {activeConnections.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-pink-400">Active Connections</h3>
                          {activeConnections.map(id => {
                            const connection = connections.find(c => c.id === id);
                            if (!connection) return null;
                            return (
                              <div key={id} className="bg-gray-700/50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl">{connection.icon}</span>
                                    <div>
                                      <h3 className="font-medium">{connection.title}</h3>
                                      <p className="text-sm text-gray-400">{connection.description}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setActiveConnections(activeConnections.filter(c => c !== id))}
                                    className="text-gray-400 hover:text-red-400"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Token Metadata Form - Full Width */}
          <div className="mt-8 bg-gray-800/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Token Metadata</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Token Name</label>
                <input
                  type="text"
                  value={tokenMetadata.name}
                  onChange={(e) => setTokenMetadata({...tokenMetadata, name: e.target.value})}
                  className="w-full bg-gray-900 rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="My Token"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Token Symbol</label>
                <input
                  type="text"
                  value={tokenMetadata.symbol}
                  onChange={(e) => setTokenMetadata({...tokenMetadata, symbol: e.target.value})}
                  className="w-full bg-gray-900 rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="MTK"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Total Supply</label>
                <input
                  type="text"
                  value={tokenMetadata.totalSupply}
                  onChange={(e) => setTokenMetadata({...tokenMetadata, totalSupply: e.target.value})}
                  className="w-full bg-gray-900 rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="1,000,000"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Decimals</label>
                <input
                  type="number"
                  value={tokenMetadata.decimals}
                  onChange={(e) => setTokenMetadata({...tokenMetadata, decimals: e.target.value})}
                  className="w-full bg-gray-900 rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="9"
                  min="0"
                  max="9"
                />
              </div>
            </div>
          </div>

          {/* Deploy Button - Full Width */}
          <div className="mt-8 col-span-full">
            <button 
              onClick={handleDeploy}
              disabled={!connected || isDeploying}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-colors transform hover:scale-[1.02] active:scale-[0.98] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!connected ? 'Connect Wallet to Deploy' : isDeploying ? 'Deploying...' : 'Deploy Token'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 