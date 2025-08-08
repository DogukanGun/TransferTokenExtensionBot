use anchor_lang::prelude::*;
use crate::{
    constants::{FEE_TIER_SEED, MAX_FEE_RATE}, 
    errors::PoolError, 
    state::{FeeTier, PoolConfig}
};

#[derive(Accounts)]
#[instruction(tick_spacing: u16, default_fee_rate: u16)]
pub struct InitializeFeeTier<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        constraint = fee_authority.key() == config.fee_authority @ PoolError::InvalidTokenMintOrder
    )]
    pub fee_authority: Signer<'info>,
    
    #[account(
        seeds = [CONFIG_SEED.as_bytes()],
        bump = config.bump
    )]
    pub config: Account<'info, PoolConfig>,
    
    #[account(
        init,
        seeds = [
            FEE_TIER_SEED.as_bytes(),
            config.key().as_ref(),
            &tick_spacing.to_le_bytes()
        ],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<FeeTier>()
    )]
    pub fee_tier: Account<'info, FeeTier>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeFeeTier>,
    tick_spacing: u16,
    default_fee_rate: u16,
) -> Result<()> {
    // Validate tick spacing
    if tick_spacing == 0 {
        return Err(PoolError::InvalidTickSpacing.into());
    }
    
    // Validate fee rate
    if default_fee_rate > MAX_FEE_RATE {
        return Err(PoolError::FeeRateMaxExceeded.into());
    }
    
    // Initialize fee tier
    let fee_tier = &mut ctx.accounts.fee_tier;
    fee_tier.bump = ctx.bumps.fee_tier;
    fee_tier.config = ctx.accounts.config.key();
    fee_tier.tick_spacing = tick_spacing;
    fee_tier.default_fee_rate = default_fee_rate;
    
    Ok(())
}

use crate::constants::CONFIG_SEED; 