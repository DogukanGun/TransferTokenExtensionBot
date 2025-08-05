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

const PROGRAM_ID = new PublicKey('F4RupoT7DMW6dDbkzoyG3R3LndyW9EJEeBp4FvMu9v56');

export class TokenService {
  constructor(private connection: Connection) {}

  async deployToken(
    tokenMetadata: TokenMetadata,
    features: FeatureConfig,
    wallet: PublicKey,
    mint: PublicKey
  ) {
    try {
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
          const addToWhitelistIx = await this.createAddToWhitelistInstruction(
            new PublicKey(address),
            tokenInfoPDA,
            wallet
          );
          transaction.add(addToWhitelistIx);
        }
      }

      return transaction;
    } catch (error) {
      console.error('Error creating token deployment transaction:', error);
      throw error;
    }
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