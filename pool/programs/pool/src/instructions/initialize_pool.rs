use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::{
    constants::{POOL_SEED, MIN_SQRT_PRICE, MAX_SQRT_PRICE}, 
    errors::PoolError, 
    events::PoolCreatedEvent, 
    state::{FeeTier, Pool, PoolConfig, WhirlpoolBumps}
};

#[derive(Accounts)]
#[instruction(bumps: WhirlpoolBumps, tick_spacing: u16, initial_sqrt_price: u128)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub token_mint_a: Account<'info, Mint>,
    
    pub token_mint_b: Account<'info, Mint>,
    
    #[account(
        init,
        payer = payer,
        token::mint = token_mint_a,
        token::authority = pool,
    )]
    pub token_vault_a: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = payer,
        token::mint = token_mint_b,
        token::authority = pool,
    )]
    pub token_vault_b: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [CONFIG_SEED.as_bytes()],
        bump = config.bump
    )]
    pub config: Account<'info, PoolConfig>,
    
    #[account(
        seeds = [
            FEE_TIER_SEED.as_bytes(),
            config.key().as_ref(),
            &tick_spacing.to_le_bytes()
        ],
        bump = fee_tier.bump
    )]
    pub fee_tier: Account<'info, FeeTier>,
    
    #[account(
        init,
        seeds = [
            POOL_SEED.as_bytes(),
            token_mint_a.key().as_ref(),
            token_mint_b.key().as_ref(),
            &tick_spacing.to_le_bytes()
        ],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<Pool>()
    )]
    pub pool: Account<'info, Pool>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializePool>,
    bumps: WhirlpoolBumps,
    tick_spacing: u16,
    initial_sqrt_price: u128,
) -> Result<()> {
    // Validate token mint order
    if ctx.accounts.token_mint_a.key() >= ctx.accounts.token_mint_b.key() {
        return Err(PoolError::InvalidTokenMintOrder.into());
    }
    
    // Validate sqrt price is within bounds
    if initial_sqrt_price < MIN_SQRT_PRICE || initial_sqrt_price > MAX_SQRT_PRICE {
        return Err(PoolError::SqrtPriceOutOfBounds.into());
    }
    
    // Initialize pool
    let pool = &mut ctx.accounts.pool;
    pool.bump = bumps.pool_bump;
    pool.config = ctx.accounts.config.key();
    pool.token_mint_a = ctx.accounts.token_mint_a.key();
    pool.token_mint_b = ctx.accounts.token_mint_b.key();
    pool.token_vault_a = ctx.accounts.token_vault_a.key();
    pool.token_vault_b = ctx.accounts.token_vault_b.key();
    pool.fee_tier = ctx.accounts.fee_tier.key();
    pool.tick_current_index = 0; // Start at tick 0
    pool.sqrt_price = initial_sqrt_price;
    pool.fee_growth_global_a = 0;
    pool.fee_growth_global_b = 0;
    pool.protocol_fee_owed_a = 0;
    pool.protocol_fee_owed_b = 0;
    pool.liquidity = 0;
    pool.fee_rate = ctx.accounts.fee_tier.default_fee_rate;
    pool.protocol_fee_rate = ctx.accounts.config.default_protocol_fee_rate;
    pool.tick_spacing = tick_spacing;
    
    // Initialize reward infos with default values
    pool.reward_infos = Default::default();
    
    // Emit event
    emit!(PoolCreatedEvent {
        pool_id: pool.key(),
        token_mint_a: pool.token_mint_a,
        token_mint_b: pool.token_mint_b,
        tick_spacing: pool.tick_spacing,
        initial_sqrt_price,
    });
    
    Ok(())
}

use crate::constants::{CONFIG_SEED, FEE_TIER_SEED}; 