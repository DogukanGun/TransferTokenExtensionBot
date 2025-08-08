# Token2022 Builder + Transfer-Hook Guarded AMM

### One‑liner
Ship a Token‑2022 mint with production‑ready transfer controls (whitelist, whale‑alert, transfer‑limit) and spin up liquidity on your choice of AMM (Orca, Meteora, or our custom CLMM‑style pool) — all from a single web UI.

---

### Deployed Program IDs (devnet)
- token_contract_id: `F4RupoT7DMW6dDbkzoyG3R3LndyW9EJEeBp4FvMu9v56`
- pool_contract_id: `ATjeowb5mBhPDtRiUAstjDVkCNGYyyP5Wze3P1C2WqC9`

---

### Why this matters
- **Safer launches**: Token‑2022 transfer hooks let founders enforce simple but powerful safety rails at the token layer.
- **Go‑to‑market in minutes**: Create a mint, configure transfer rules, and connect to liquidity in one flow.
- **Composability**: Works with external AMMs (Orca, Meteora) and includes a custom pool for permissionless experimentation.

---

### What the app does (demo flow)
1. **Configure features**: Drag‑and‑drop to enable:
   - **Whitelist**: Only approved addresses can transfer.
   - **Transfer limit**: Cap the maximum amount per transfer.
   - **Whale alert**: Emit an on‑chain event when large transfers occur.
2. **Deploy mint**: The UI creates a Token‑2022 mint then initializes the token info PDA with your feature flags.
3. **Launch liquidity**: Pick one connector:
   - **Orca Whirlpools**: One‑click pool creation with USDC. Note: pool functionality depends on Orca whitelisting.
   - **Meteora**: Redirect to Meteora for required whitelisting and setup.
   - **Custom Pool (this repo)**: Create a permissionless pool with concentrated‑liquidity‑style accounting.
4. **Track status**: The UI shows the created pool address and any messages (e.g., “pool already exists”).

---

### Architecture overview
- **Frontend**: Next.js app (`platform/`) with wallet adapter. UX is a single page (`dashboard/page.tsx`) that:
  - Mints a Token‑2022 token.
  - Sends an initialize instruction to configure the transfer‑hook rules.
  - Calls the chosen AMM connector to create a pool.
- **Token contract**: Anchor program (`smart_contracts/programs/amm_with_transfer_hook`) implementing the transfer hook and token configuration PDAs.
- **Pool contract**: Anchor program (`pool/programs/pool`) implementing pool/config/fee‑tier/tick‑array initialization and core math utilities.

---

### Token‑2022 Transfer‑Hook Contract
- **Program ID**: `F4RupoT7DMW6dDbkzoyG3R3LndyW9EJEeBp4FvMu9v56`
- **Core state**: `TokenInfo` PDA at `seeds = ["token-info", mint]` stores:
  - `token_name`, `token_symbol`, `token_decimals`, `token_total_supply`, `token_mint`, `token_creator`
  - Flags: `is_whale_enabled`, `is_whitelist_enabled`, `is_total_transfer_amount_enabled`
  - Params: `whale_amount`, `total_transfer_amount`
  - `whitelist_addresses: Vec<Pubkey>` (dynamic reallocation with rent adjustments)
- **Extra Account Metas**: `seeds = ["extra-account-metas", mint]` prepared to support Token‑2022 transfer‑hook account resolution.
- **Instructions**:
  - `initialize_token_info(...)`: Creates/initializes `TokenInfo` and extra account metas with your flags and parameters.
  - `add_to_whitelist(pubkey)`: Adds address; reallocs account and tops up rent if needed.
  - `set_max_transfer_limit(limit)`: Enables and sets per‑transfer cap.
  - `update_whale_alert(enable, amount)`: Toggles whale alert and sets threshold.
  - `transfer_hook(amount)`: Enforced by the Token‑2022 program on transfer.
- **Enforcement logic (called during transfer)**:
  - Verifies the call is inside a real transfer via Token‑2022 `TransferHookAccount.transferring`.
  - If whitelist enabled, rejects if `owner` is not in `whitelist_addresses`.
  - If transfer‑limit enabled, rejects when `amount > total_transfer_amount`.
  - If whale‑alert enabled and `amount >= whale_amount`, emits `WhaleTransferEvent { whale_address, transfer_amount }`.
- **Key errors**:
  - `NotWhitelisted`, `TransferLimitExceeded`, `NotInTransferHook`, `WhitelistDisabled`.

---

### Custom Pool Contract (CLMM‑style initialization)
- **Program ID**: `ATjeowb5mBhPDtRiUAstjDVkCNGYyyP5Wze3P1C2WqC9`
- **What’s implemented**:
  - `initialize_config(fee_authority, collect_protocol_fees_authority, reward_emissions_super_authority, default_protocol_fee_rate)`
  - `initialize_fee_tier(tick_spacing, default_fee_rate)`
  - `initialize_pool(bumps, tick_spacing, initial_sqrt_price)`
  - `initialize_tick_array(start_tick_index)`
- **Pool state**: stores vaults for token A/B, fee tier, fee rates, protocol fees owed, current `sqrt_price` (Q64.64), `tick_current_index`, `liquidity`, and reward slots.
- **Deterministic addresses**:
  - `pool`: seeds `["pool", token_mint_a, token_mint_b, tick_spacing]`
  - `token_vault_a`: seeds `["token_vault_a", pool]`
  - `token_vault_b`: seeds `["token_vault_b", pool]`
  - `config`: seeds `["config"]`, `fee_tier`: seeds `["fee_tier", config, tick_spacing]`
- **Validation on init**:
  - Enforces `token_mint_a < token_mint_b` (stable ordering).
  - Checks `initial_sqrt_price` within bounds.
- **Math utilities**: includes `sqrt_price_math`, `liquidity_math`, and `tick_math` modules to support CLMM accounting primitives.
- **Events**: emits `PoolCreatedEvent` on successful init.

---

### External AMM Connectors (from the UI)
- **Orca (Whirlpools)**
  - Uses `@orca-so/whirlpools` to create a USDC pair on devnet via `createSplashPool(...)`.
  - Note: Full functionality depends on Orca’s whitelisting of the new token.
- **Meteora**
  - Integration requires whitelisting. The UI guides you to `app.meteora.ag` to complete setup.
- **Custom Pool (this repo)**
  - Permissionless path: programmatically initializes `config` (if absent), `fee_tier`, and then `pool` with your token + devnet USDC.
  - Price input is converted to `initial_sqrt_price = sqrt(price) * 2^64` and passed to `initialize_pool`.

---

### How to run (devnet)
- **Prereqs**: Node 18+, pnpm/npm, Phantom (or compatible) wallet funded on devnet.
- **Run UI**:
  - `cd platform && npm install && npm run dev`
  - Open `http://localhost:3000` and connect your wallet (devnet).
- **Demo flow**:
  - Configure features (drag‑and‑drop), fill token metadata, click “Deploy Token”.
  - Choose a connector under “Available Connections”, then click “Deploy Token” to mint and create a pool.
  - UI will display the created pool address and messages (e.g., requires whitelisting).

---

### Security model & limitations
- Transfer rules are enforced by the Token‑2022 transfer hook at the token program level.
- Whitelist list growth/shrink is rent‑safe (top‑up on expand, refund on shrink). A conservative `MAX_WHITELIST` is used for initial sizing; dynamic realloc covers expansion.
- The custom pool showcases CLMM‑style accounting primitives and initialization. It is a reference design, not audited. Use at your own risk.
- Orca/Meteora integrations reflect real protocol constraints (whitelisting, extra setup) and are surfaced in‑UI.

---

### What’s novel
- End‑to‑end founder tooling: mint + transfer‑guard + liquidity in a single UX.
- Transfer‑hook enforcement that’s simple to reason about and observable on‑chain (whale events).
- Flexible path to liquidity: permissioned (Orca/Meteora) or permissionless (custom pool).

---