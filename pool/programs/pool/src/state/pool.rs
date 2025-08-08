use anchor_lang::prelude::*;
use crate::constants::NUM_REWARDS;

#[account]
#[derive(Default)]
pub struct Pool {
    // Bump to identify PDA
    pub bump: u8,
    
    // Config account that this pool belongs to
    pub config: Pubkey,
    
    // Token mint for token A
    pub token_mint_a: Pubkey,
    
    // Token mint for token B
    pub token_mint_b: Pubkey,
    
    // Token vault for token A
    pub token_vault_a: Pubkey,
    
    // Token vault for token B
    pub token_vault_b: Pubkey,
    
    // Fee tier account
    pub fee_tier: Pubkey,
    
    // Current tick index
    pub tick_current_index: i32,
    
    // Current sqrt price
    pub sqrt_price: u128,
    
    // Fee growth of token A
    pub fee_growth_global_a: u128,
    
    // Fee growth of token B
    pub fee_growth_global_b: u128,
    
    // Protocol fee owed to token A
    pub protocol_fee_owed_a: u64,
    
    // Protocol fee owed to token B
    pub protocol_fee_owed_b: u64,
    
    // Liquidity
    pub liquidity: u128,
    
    // Fee rate in hundredths of a basis point (0.0001%)
    pub fee_rate: u16,
    
    // Protocol fee rate in basis points (0.01%)
    pub protocol_fee_rate: u16,
    
    // Tick spacing
    pub tick_spacing: u16,
    
    // Reward data for each reward
    pub reward_infos: [RewardInfo; NUM_REWARDS],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct RewardInfo {
    // Authority that can set emissions
    pub authority: Pubkey,
    
    // Reward mint
    pub mint: Pubkey,
    
    // Reward vault
    pub vault: Pubkey,
    
    // Emissions per second (Q64.64)
    pub emissions_per_second_x64: u128,
    
    // Growth of reward globally (Q64.64)
    pub growth_global_x64: u128,
    
    // Last updated timestamp
    pub last_updated_timestamp: u64,
} 