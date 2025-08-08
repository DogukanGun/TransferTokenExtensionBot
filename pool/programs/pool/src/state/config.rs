use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct PoolConfig {
    // Bump to identify PDA
    pub bump: u8,
    
    // Authority that can set fees
    pub fee_authority: Pubkey,
    
    // Authority that can collect protocol fees
    pub collect_protocol_fees_authority: Pubkey,
    
    // Authority that can set reward emissions super authority
    pub reward_emissions_super_authority: Pubkey,
    
    // Default protocol fee rate in basis points (0.01%)
    pub default_protocol_fee_rate: u16,
} 