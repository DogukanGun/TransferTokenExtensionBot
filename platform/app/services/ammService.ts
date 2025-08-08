import { createSplashPool, setWhirlpoolsConfig } from '@orca-so/whirlpools';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { address } from '@solana/kit';
import { BN } from 'bn.js';
import * as anchor from '@project-serum/anchor';
import { Pool } from '../../smart_contract_targets/pool';

export type AmmType = 'orca' | 'meteora' | 'custom';

// Contract addresses
const POOL_PROGRAM_ID = 'ATjeowb5mBhPDtRiUAstjDVkCNGYyyP5Wze3P1C2WqC9';
const DEVNET_USDC_ADDRESS = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';

export class AmmService {
  constructor(private connection: Connection) {}

  async createPool(
    ammType: AmmType,
    tokenMint: PublicKey,
    initialPrice: number,
    wallet: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {
    switch (ammType) {
      case 'orca':
        return this.createOrcaPool(tokenMint);
      case 'meteora':
        return this.createMeteoraPool(tokenMint, initialPrice, wallet, signTransaction);
      case 'custom':
        return this.createCustomPool(tokenMint, initialPrice, wallet, signTransaction);
      default:
        throw new Error('Unsupported AMM type');
    }
  }

  private async createOrcaPool(tokenMint: PublicKey) {
    try {
      // Configure Orca SDK for devnet
      await setWhirlpoolsConfig('solanaDevnet');

      // Create pool with USDC (using devnet USDC address)
      const devUsdcMint = new PublicKey(DEVNET_USDC_ADDRESS);
      
      const { poolAddress, callback } = await createSplashPool(
        address(tokenMint.toBase58()),
        address(devUsdcMint.toBase58())
      );

      // Execute the transaction
      const signature = await callback();

      return {
        poolAddress,
        signature,
        message: 'Note: Pool requires whitelisting from Orca protocol for full functionality.'
      };
    } catch (error) {
      console.error('Error creating Orca pool:', error);
      throw error;
    }
  }

  private async createMeteoraPool(
    tokenMint: PublicKey,
    initialPrice: number,
    wallet: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {
    try {
      const devUsdcMint = new PublicKey(DEVNET_USDC_ADDRESS);

      // For now, return a message about Meteora integration
      return {
        poolAddress: wallet,
        signature: '',
        message: 'Meteora pool creation requires additional setup. Please visit app.meteora.ag to create a pool.'
      };
    } catch (error) {
      console.error('Error creating Meteora pool:', error);
      throw error;
    }
  }

  private async createCustomPool(
    tokenMint: PublicKey,
    initialPrice: number,
    wallet: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {
    try {
      // Use devnet USDC as the second token
      const devUsdcMint = new PublicKey(DEVNET_USDC_ADDRESS);
      
      // Initialize Anchor and get the program
      const provider = new anchor.AnchorProvider(
        this.connection,
        {
          publicKey: wallet,
          signTransaction,
          signAllTransactions: async (txs) => {
            return Promise.all(txs.map(tx => signTransaction(tx)));
          }
        },
        { commitment: 'confirmed' }
      );
      
      // Get the program ID from the Pool type
      const programId = new PublicKey(POOL_PROGRAM_ID);
      
      // Create IDL from Pool type
      const idl: anchor.Idl = {
        version: "0.1.0",
        name: "pool",
        instructions: [
          {
            name: "initializeConfig",
            accounts: [
              { name: "payer", isMut: true, isSigner: true },
              { name: "config", isMut: true, isSigner: false },
              { name: "systemProgram", isMut: false, isSigner: false }
            ],
            args: [
              { name: "feeAuthority", type: "publicKey" },
              { name: "collectProtocolFeesAuthority", type: "publicKey" },
              { name: "rewardEmissionsSuperAuthority", type: "publicKey" },
              { name: "defaultProtocolFeeRate", type: "u16" }
            ]
          },
          {
            name: "initializePool",
            accounts: [
              { name: "payer", isMut: true, isSigner: true },
              { name: "tokenMintA", isMut: false, isSigner: false },
              { name: "tokenMintB", isMut: false, isSigner: false },
              { name: "tokenVaultA", isMut: true, isSigner: false },
              { name: "tokenVaultB", isMut: true, isSigner: false },
              { name: "config", isMut: false, isSigner: false },
              { name: "feeTier", isMut: false, isSigner: false },
              { name: "pool", isMut: true, isSigner: false },
              { name: "tokenProgram", isMut: false, isSigner: false },
              { name: "systemProgram", isMut: false, isSigner: false },
              { name: "rent", isMut: false, isSigner: false }
            ],
            args: [
              { name: "bumps", type: { defined: "WhirlpoolBumps" } },
              { name: "tickSpacing", type: "u16" },
              { name: "initialSqrtPrice", type: "u128" }
            ]
          },
          {
            name: "initializeTickArray",
            accounts: [
              { name: "payer", isMut: true, isSigner: true },
              { name: "pool", isMut: false, isSigner: false },
              { name: "tickArray", isMut: true, isSigner: false },
              { name: "systemProgram", isMut: false, isSigner: false }
            ],
            args: [
              { name: "startTickIndex", type: "i32" }
            ]
          },
          {
            name: "initializeFeeTier",
            accounts: [
              { name: "payer", isMut: true, isSigner: true },
              { name: "feeAuthority", isMut: false, isSigner: true },
              { name: "config", isMut: false, isSigner: false },
              { name: "feeTier", isMut: true, isSigner: false },
              { name: "systemProgram", isMut: false, isSigner: false }
            ],
            args: [
              { name: "tickSpacing", type: "u16" },
              { name: "defaultFeeRate", type: "u16" }
            ]
          }
        ],
        accounts: [],
        types: [
          {
            name: "WhirlpoolBumps",
            type: {
              kind: "struct",
              fields: [
                { name: "poolBump", type: "u8" }
              ]
            }
          }
        ]
      };
      
      // Create program instance
      const program = new anchor.Program(
        idl,
        programId,
        provider
      );

      // First, initialize config if it doesn't exist yet
      const configAddress = await this.getOrCreatePoolConfig(program, wallet, signTransaction);
      
      // Create fee tier with tick spacing of 64
      const tickSpacing = 64;
      const defaultFeeRate = 3000; // 0.3%
      
      const feeTierAddress = await this.getOrCreateFeeTier(
        program,
        configAddress,
        tickSpacing,
        defaultFeeRate,
        wallet,
        signTransaction
      );
      
      // Convert initialPrice to sqrt price (x * 2^64)
      const initialSqrtPrice = Math.sqrt(initialPrice) * Math.pow(2, 64);
      
      // Find the PDA for the pool
      const [poolAddress] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from('pool'),
          tokenMint.toBuffer(),
          devUsdcMint.toBuffer(),
          Buffer.from(new Uint8Array([tickSpacing & 0xff, (tickSpacing >> 8) & 0xff]))
        ],
        programId
      );
      
      // Create token vaults
      const [tokenVaultA] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('token_vault_a'), poolAddress.toBuffer()],
        programId
      );
      
      const [tokenVaultB] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('token_vault_b'), poolAddress.toBuffer()],
        programId
      );
      
      // Check if pool already exists
      try {
        await program.account.pool.fetch(poolAddress);
        return {
          poolAddress,
          signature: '',
          message: 'Pool already exists.'
        };
      } catch (e) {
        // Pool doesn't exist, continue with creation
      }
      
      // Create the pool
      const tx = await program.methods
        .initializePool(
          { poolBump: 0 }, // Bump will be filled in by the program
          tickSpacing,
          new BN(initialSqrtPrice.toString())
        )
        .accounts({
          payer: wallet,
          tokenMintA: tokenMint,
          tokenMintB: devUsdcMint,
          tokenVaultA,
          tokenVaultB,
          config: configAddress,
          feeTier: feeTierAddress,
          pool: poolAddress,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .transaction();
      
      const signedTx = await signTransaction(tx);
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());
      
      await this.connection.confirmTransaction(signature);
      
      return {
        poolAddress,
        signature,
        message: 'Custom pool created successfully!'
      };
    } catch (error) {
      console.error('Error creating custom pool:', error);
      throw error;
    }
  }

  private async getOrCreatePoolConfig(
    program: anchor.Program,
    wallet: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<PublicKey> {
    const [configAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('config')],
      program.programId
    );
    
    try {
      await program.account.poolConfig.fetch(configAddress);
      return configAddress;
    } catch (e) {
      // Config doesn't exist, create it
      const tx = await program.methods
        .initializeConfig(
          wallet, // fee authority
          wallet, // collect protocol fees authority
          wallet, // reward emissions super authority
          100 // default protocol fee rate (1%)
        )
        .accounts({
          payer: wallet,
          config: configAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .transaction();
      
      const signedTx = await signTransaction(tx);
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());
      await this.connection.confirmTransaction(signature);
      
      return configAddress;
    }
  }

  private async getOrCreateFeeTier(
    program: anchor.Program,
    configAddress: PublicKey,
    tickSpacing: number,
    defaultFeeRate: number,
    wallet: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<PublicKey> {
    const [feeTierAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from('fee_tier'),
        configAddress.toBuffer(),
        Buffer.from(new Uint8Array([tickSpacing & 0xff, (tickSpacing >> 8) & 0xff]))
      ],
      program.programId
    );
    
    try {
      await program.account.feeTier.fetch(feeTierAddress);
      return feeTierAddress;
    } catch (e) {
      // Fee tier doesn't exist, create it
      const tx = await program.methods
        .initializeFeeTier(
          tickSpacing,
          defaultFeeRate
        )
        .accounts({
          payer: wallet,
          feeAuthority: wallet,
          config: configAddress,
          feeTier: feeTierAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .transaction();
      
      const signedTx = await signTransaction(tx);
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());
      await this.connection.confirmTransaction(signature);
      
      return feeTierAddress;
    }
  }
}