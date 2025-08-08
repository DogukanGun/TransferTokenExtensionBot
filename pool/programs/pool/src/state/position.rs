use anchor_lang::prelude::*;
use crate::{constants::NUM_REWARDS, state::LockType};

#[account]
#[derive(Default)]
pub struct Position {
    // Bump to identify PDA
    pub bump: u8,
    
    // Pool this position belongs to
    pub pool: Pubkey,
    
    // Position owner
    pub position_mint: Pubkey,
    
    // Lower tick index
    pub tick_lower_index: i32,
    
    // Upper tick index
    pub tick_upper_index: i32,
    
    // Liquidity amount
    pub liquidity: u128,
    
    // Fee growth of token A inside position
    pub fee_growth_checkpoint_a: u128,
    
    // Fee growth of token B inside position
    pub fee_growth_checkpoint_b: u128,
    
    // Fees owed for token A
    pub fee_owed_a: u64,
    
    // Fees owed for token B
    pub fee_owed_b: u64,
    
    // Reward growth checkpoints
    pub reward_infos: [PositionRewardInfo; NUM_REWARDS],
    
    // Lock status of the position
    pub lock_type: LockType,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct PositionRewardInfo {
    // Growth inside position last time it was updated
    pub growth_inside_checkpoint: u128,
    
    // Amount owed to this position
    pub amount_owed: u64,
}

#[account]
#[derive(Default)]
pub struct PositionBundle {
    // Bump to identify PDA
    pub bump: u8,
    
    // Position bundle mint
    pub position_bundle_mint: Pubkey,
    
    // Positions in this bundle - using Vec instead of fixed array for Default implementation
    pub positions: Vec<Option<BundledPosition>>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct BundledPosition {
    // Pool this position belongs to
    pub pool: Pubkey,
    
    // Lower tick index
    pub tick_lower_index: i32,
    
    // Upper tick index
    pub tick_upper_index: i32,
    
    // Liquidity amount
    pub liquidity: u128,
    
    // Fee growth of token A inside position
    pub fee_growth_checkpoint_a: u128,
    
    // Fee growth of token B inside position
    pub fee_growth_checkpoint_b: u128,
    
    // Fees owed for token A
    pub fee_owed_a: u64,
    
    // Fees owed for token B
    pub fee_owed_b: u64,
    
    // Reward growth checkpoints
    pub reward_infos: [PositionRewardInfo; NUM_REWARDS],
} 