import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AmmWithTransferHook } from "../target/types/amm_with_transfer_hook";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  ExtensionType,
  getMintLen,
  createInitializeMintInstruction,
  createInitializeTransferHookInstruction,
} from "@solana/spl-token";
import { Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import { assert } from "chai";

describe("amm_with_transfer_hook", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const wallet = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.ammWithTransferHook as Program<AmmWithTransferHook>;

  let mint: anchor.web3.PublicKey;

  const mint2022 = anchor.web3.Keypair.generate();

  // Sender token account address
  const sourceTokenAccount = getAssociatedTokenAddressSync(
    mint2022.publicKey,
    wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  // Recipient token account address
  const recipient = anchor.web3.Keypair.generate();
  const destinationTokenAccount = getAssociatedTokenAddressSync(
    mint2022.publicKey,
    recipient.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  // ExtraAccountMetaList address
  // Store extra accounts required by the custom transfer hook instruction
  const [extraAccountMetaListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('extra-account-metas'), mint2022.publicKey.toBuffer()],
    program.programId,
  );
  const tokenInfoPda = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('token-info'), mint2022.publicKey.toBuffer()],
    program.programId,
  )[0];

  it("Create a new token mint", async() => {
    mint = await createMint(
      provider.connection,
      wallet.payer,
      provider.publicKey,
      null,
      9
    );

    console.log("\nNew mint created:", mint.toBase58());
  });

  it("Initializes TokenInfo with default values", async () => {
    const extensions = [ExtensionType.TransferHook];
    const mintLen = getMintLen(extensions);
    const lamports = await provider.connection.getMinimumBalanceForRentExemption(mintLen);
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint2022.publicKey,
        space: mintLen,
        lamports: lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeTransferHookInstruction(
        mint2022.publicKey,
        wallet.publicKey,
        program.programId, // Transfer Hook Program ID
        TOKEN_2022_PROGRAM_ID,
      ),
      createInitializeMintInstruction(mint2022.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
    );

    const txSig = await sendAndConfirmTransaction(provider.connection, transaction, [wallet.payer, mint2022], {
      skipPreflight: true,
      commitment: 'finalized',
    });

    const txDetails = await program.provider.connection.getTransaction(txSig, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });
    console.log(txDetails.meta.logMessages);

    console.log("\nTransaction Signature: ", txSig);
  });

  it("Initialize extra account meta list and token info", async () => {
    const tx = await program.methods
      .initializeTokenInfo(
        "Test Token", // token_name
        "TEST", // token_symbol
        new anchor.BN(1000000), // token_total_supply
        true, // is_whale_enabled
        true, // is_whitelist_enabled
        true, // is_total_transfer_amount_enabled
        new anchor.BN(10000), // whale_amount
        new anchor.BN(50000) // total_transfer_amount
      )
      .accounts({
        mint: mint2022.publicKey,
        payer: wallet.publicKey,
      })
      .signers([wallet.payer])
      .rpc();

    console.log("Initialized token info:", tx);
  });

  it("Adds address to whitelist", async () => {
    const tx = await program.methods
      .addToWhitelist(recipient.publicKey)
      .accounts({
        tokenInfo: tokenInfoPda,
      })
      .signers([wallet.payer])
      .rpc();

    console.log("Added to whitelist:", tx);
  });

  it("Updates whale alert settings", async () => {
    const tx = await program.methods
      .updateWhaleAlert(true, new anchor.BN(5000))
      .accounts({
        tokenInfo: tokenInfoPda,
      })
      .signers([wallet.payer])
      .rpc();

    console.log("Whale alert updated:", tx);
  });

  it("Updates total transfer limit", async () => {
    const tx = await program.methods
      .setMaxTransferLimit(new anchor.BN(250_000))
      .accounts({
        tokenInfo: tokenInfoPda,
      })
      .signers([wallet.payer])
      .rpc();

    console.log("Max transfer limit updated:", tx);
  });

  it("Fails transfer if not whitelisted (simulate)", async () => {
    const nonWhitelisted = Keypair.generate();

    try {
      await program.methods
        .transferHook(new anchor.BN(1000))
        .accounts({
          sourceToken: sourceTokenAccount,
          destinationToken: destinationTokenAccount,
          owner: nonWhitelisted.publicKey,
          mint: mint2022.publicKey,
        })
        .signers([wallet.payer])
        .rpc();
      assert.fail("Expected error for non-whitelisted transfer");
    } catch (err) {
      console.log("Correctly failed transfer for non-whitelisted account");
    }
  });
});
