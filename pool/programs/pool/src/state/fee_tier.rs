use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct FeeTier {
    // Bump to identify PDA
    pub bump: u8,
    
    // Config this fee tier belongs to
    pub config: Pubkey,
    
    // Tick spacing for this fee tier
    pub tick_spacing: u16,
    
    // Default fee rate in hundredths of a basis point (0.0001%)
    pub default_fee_rate: u16,
} 