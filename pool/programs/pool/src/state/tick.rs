use anchor_lang::prelude::*;
use crate::constants::NUM_REWARDS;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct Tick {
    // True if initialized
    pub initialized: bool,
    
    // Liquidity net value
    pub liquidity_net: i128,
    
    // Liquidity gross value
    pub liquidity_gross: u128,
    
    // Fee growth outside of tick range for token A
    pub fee_growth_outside_a: u128,
    
    // Fee growth outside of tick range for token B
    pub fee_growth_outside_b: u128,
    
    // Reward growths outside of tick range
    pub reward_growths_outside: [u128; NUM_REWARDS],
} 