import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { BN } from 'bn.js';

export interface TokenMetadata {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: string;
}

export interface FeatureConfig {
  whaleAlert?: {
    isEnabled: boolean;
    amount: string;
  };
  whitelist?: {
    isEnabled: boolean;
    addresses: string[];
  };
  transferLimit?: {
    isEnabled: boolean;
    amount: string;
  };
}

export interface TokenDeploymentResult {
  transaction: Transaction;
  extraAccountMetaListPDA: PublicKey;
  tokenInfoPDA: PublicKey;
}

const PROGRAM_ID = new PublicKey('F4RupoT7DMW6dDbkzoyG3R3LndyW9EJEeBp4FvMu9v56');

export class TokenService {
  constructor(private connection: Connection) {}

  async deployToken(
    tokenMetadata: TokenMetadata,
    features: FeatureConfig,
    wallet: PublicKey,
    mint: PublicKey
  ): Promise<TokenDeploymentResult> {
    try {
      // Input validation
      if (!tokenMetadata.name || !tokenMetadata.symbol || !tokenMetadata.totalSupply) {
        throw new Error('Token metadata is incomplete. Name, symbol, and total supply are required.');
      }
      if (!wallet) {
        throw new Error('Wallet is required');
      }
      if (!mint) {
        throw new Error('Mint is required');
      }

      // Validate token metadata
      if (tokenMetadata.name.length === 0 || tokenMetadata.symbol.length === 0) {
        throw new Error('Token name and symbol cannot be empty');
      }
      
      const totalSupply = new BN(tokenMetadata.totalSupply);
      if (totalSupply.isZero() || totalSupply.isNeg()) {
        throw new Error('Total supply must be greater than 0');
      }

      const decimals = parseInt(tokenMetadata.decimals);
      if (isNaN(decimals) || decimals < 0 || decimals > 9) {
        throw new Error('Decimals must be between 0 and 9');
      }

      // Create PDAs
      const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('extra-account-metas'), mint.toBuffer()],
        PROGRAM_ID
      );

      const [tokenInfoPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('token-info'), mint.toBuffer()],
        PROGRAM_ID
      );

      // Create initialize instruction
      const initializeIx = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          {
            pubkey: wallet,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: extraAccountMetaListPDA,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: tokenInfoPDA,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: mint,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: Buffer.from([
          // Initialize instruction discriminator
          214, 255, 202, 75, 11, 184, 55, 139,
          // Token metadata
          ...this.serializeString(tokenMetadata.name),
          ...this.serializeString(tokenMetadata.symbol),
          ...this.serializeU64(tokenMetadata.totalSupply),
          // Feature flags
          features.whaleAlert?.isEnabled ? 1 : 0,
          features.whitelist?.isEnabled ? 1 : 0,
          features.transferLimit?.isEnabled ? 1 : 0,
          // Feature amounts
          ...this.serializeU64(features.whaleAlert?.amount || '0'),
          ...this.serializeU64(features.transferLimit?.amount || '0'),
        ]),
      });

      // Create transaction
      const transaction = new Transaction().add(initializeIx);

      // Add whitelist addresses if enabled
      if (features.whitelist?.isEnabled && features.whitelist.addresses.length > 0) {
        for (const address of features.whitelist.addresses) {
          try {
            const publicKey = new PublicKey(address);
            const addToWhitelistIx = await this.createAddToWhitelistInstruction(
              publicKey,
              tokenInfoPDA,
              wallet
            );
            transaction.add(addToWhitelistIx);
          } catch (error) {
            console.warn(`Invalid whitelist address: ${address}`, error);
            // Continue with other addresses
          }
        }
      }

      return {
        transaction,
        extraAccountMetaListPDA,
        tokenInfoPDA
      };
    } catch (error) {
      console.error('Error creating token deployment transaction:', error);
      throw new Error(`Token deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addToWhitelist(
    address: string,
    mint: PublicKey,
    authority: PublicKey
  ): Promise<Transaction> {
    try {
      // Input validation
      if (!address) {
        throw new Error('Address is required');
      }
      if (!mint) {
        throw new Error('Mint is required');
      }
      if (!authority) {
        throw new Error('Authority is required');
      }

      const publicKey = new PublicKey(address);
      const [tokenInfoPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('token-info'), mint.toBuffer()],
        PROGRAM_ID
      );

      const instruction = await this.createAddToWhitelistInstruction(
        publicKey,
        tokenInfoPDA,
        authority
      );

      return new Transaction().add(instruction);
    } catch (error) {
      console.error('Error creating add to whitelist transaction:', error);
      throw new Error(`Add to whitelist failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateWhaleAlert(
    mint: PublicKey,
    authority: PublicKey,
    enable: boolean,
    amount: string
  ): Promise<Transaction> {
    try {
      // Input validation
      if (!mint) {
        throw new Error('Mint is required');
      }
      if (!authority) {
        throw new Error('Authority is required');
      }

      const whaleAmount = new BN(amount);
      if (whaleAmount.isNeg()) {
        throw new Error('Whale amount must be non-negative');
      }

      const [tokenInfoPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('token-info'), mint.toBuffer()],
        PROGRAM_ID
      );

      const instruction = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          {
            pubkey: tokenInfoPDA,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: authority,
            isSigner: true,
            isWritable: false,
          },
        ],
        data: Buffer.from([
          // Update whale alert instruction discriminator
          136, 211, 248, 40, 251, 255, 155, 231,
          // Enable flag
          enable ? 1 : 0,
          // Amount
          ...Array.from(new Uint8Array(whaleAmount.toArray('le', 8))),
        ]),
      });

      return new Transaction().add(instruction);
    } catch (error) {
      console.error('Error creating update whale alert transaction:', error);
      throw new Error(`Update whale alert failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async setMaxTransferLimit(
    mint: PublicKey,
    authority: PublicKey,
    limit: string
  ): Promise<Transaction> {
    try {
      // Input validation
      if (!mint) {
        throw new Error('Mint is required');
      }
      if (!authority) {
        throw new Error('Authority is required');
      }

      const transferLimit = new BN(limit);
      if (transferLimit.isNeg()) {
        throw new Error('Transfer limit must be non-negative');
      }

      const [tokenInfoPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('token-info'), mint.toBuffer()],
        PROGRAM_ID
      );

      const instruction = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          {
            pubkey: tokenInfoPDA,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: authority,
            isSigner: true,
            isWritable: false,
          },
        ],
        data: Buffer.from([
          // Set max transfer limit instruction discriminator
          241, 64, 166, 45, 114, 132, 14, 74,
          // Limit
          ...Array.from(new Uint8Array(transferLimit.toArray('le', 8))),
        ]),
      });

      return new Transaction().add(instruction);
    } catch (error) {
      console.error('Error creating set max transfer limit transaction:', error);
      throw new Error(`Set max transfer limit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTokenInfo(mint: PublicKey): Promise<any> {
    try {
      if (!mint) {
        throw new Error('Mint is required');
      }

      const [tokenInfoPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('token-info'), mint.toBuffer()],
        PROGRAM_ID
      );

      const accountInfo = await this.connection.getAccountInfo(tokenInfoPDA);
      if (!accountInfo) {
        throw new Error('Token info not found');
      }

      // Parse the account data according to the tokenInfo structure
      // This is a simplified version - in a real implementation you'd use a proper deserializer
      return {
        address: tokenInfoPDA.toBase58(),
        exists: true,
        data: accountInfo.data
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw new Error(`Get token info failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateTokenMetadata(metadata: TokenMetadata): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!metadata.name || metadata.name.trim().length === 0) {
      errors.push('Token name is required');
    }

    if (!metadata.symbol || metadata.symbol.trim().length === 0) {
      errors.push('Token symbol is required');
    }

    if (!metadata.totalSupply) {
      errors.push('Total supply is required');
    } else {
      try {
        const totalSupply = new BN(metadata.totalSupply);
        if (totalSupply.isZero() || totalSupply.isNeg()) {
          errors.push('Total supply must be greater than 0');
        }
      } catch {
        errors.push('Total supply must be a valid number');
      }
    }

    if (!metadata.decimals) {
      errors.push('Decimals is required');
    } else {
      const decimals = parseInt(metadata.decimals);
      if (isNaN(decimals) || decimals < 0 || decimals > 9) {
        errors.push('Decimals must be between 0 and 9');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validateFeatureConfig(features: FeatureConfig): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (features.whaleAlert?.isEnabled) {
      if (!features.whaleAlert.amount) {
        errors.push('Whale alert amount is required when enabled');
      } else {
        try {
          const amount = new BN(features.whaleAlert.amount);
          if (amount.isNeg()) {
            errors.push('Whale alert amount must be non-negative');
          }
        } catch {
          errors.push('Whale alert amount must be a valid number');
        }
      }
    }

    if (features.transferLimit?.isEnabled) {
      if (!features.transferLimit.amount) {
        errors.push('Transfer limit amount is required when enabled');
      } else {
        try {
          const amount = new BN(features.transferLimit.amount);
          if (amount.isNeg()) {
            errors.push('Transfer limit amount must be non-negative');
          }
        } catch {
          errors.push('Transfer limit amount must be a valid number');
        }
      }
    }

    if (features.whitelist?.isEnabled && features.whitelist.addresses) {
      for (const address of features.whitelist.addresses) {
        try {
          new PublicKey(address);
        } catch {
          errors.push(`Invalid whitelist address: ${address}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private serializeString(str: string): number[] {
    const strBytes = Buffer.from(str);
    return [
      // String length as u32 LE
      ...new Uint8Array(new Uint32Array([strBytes.length]).buffer),
      // String bytes
      ...strBytes,
    ];
  }

  private serializeU64(value: string): number[] {
    const bn = new BN(value);
    return Array.from(new Uint8Array(bn.toArray('le', 8)));
  }

  private async createAddToWhitelistInstruction(
    address: PublicKey,
    tokenInfoPDA: PublicKey,
    authority: PublicKey
  ): Promise<TransactionInstruction> {
    return new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        {
          pubkey: tokenInfoPDA,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: authority,
          isSigner: true,
          isWritable: false,
        },
      ],
      data: Buffer.from([
        // Add to whitelist instruction discriminator
        157, 211, 52, 54, 144, 81, 5, 55,
        // Address to whitelist
        ...address.toBytes(),
      ]),
    });
  }
} 