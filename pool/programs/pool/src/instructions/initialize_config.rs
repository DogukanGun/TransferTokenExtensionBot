use anchor_lang::prelude::*;
use crate::{constants::CONFIG_SEED, errors::PoolError, state::PoolConfig};

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        init,
        seeds = [CONFIG_SEED.as_bytes()],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<PoolConfig>()
    )]
    pub config: Account<'info, PoolConfig>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeConfig>,
    fee_authority: Pubkey,
    collect_protocol_fees_authority: Pubkey,
    reward_emissions_super_authority: Pubkey,
    default_protocol_fee_rate: u16,
) -> Result<()> {
    if default_protocol_fee_rate > 10_000 {
        return Err(PoolError::ProtocolFeeRateMaxExceeded.into());
    }
    
    let config = &mut ctx.accounts.config;
    config.bump = ctx.bumps.config;
    config.fee_authority = fee_authority;
    config.collect_protocol_fees_authority = collect_protocol_fees_authority;
    config.reward_emissions_super_authority = reward_emissions_super_authority;
    config.default_protocol_fee_rate = default_protocol_fee_rate;
    
    Ok(())
} 