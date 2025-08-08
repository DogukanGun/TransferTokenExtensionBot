use anchor_lang::prelude::*;
use crate::{
    constants::{TICK_ARRAY_SEED, TICK_ARRAY_SIZE}, 
    errors::PoolError, 
    events::TickArrayCreatedEvent, 
    math::tick_math::get_tick_array_start_index, 
    state::{Pool, TickArray}
};

#[derive(Accounts)]
#[instruction(start_tick_index: i32)]
pub struct InitializeTickArray<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        seeds = [
            POOL_SEED.as_bytes(),
            pool.token_mint_a.as_ref(),
            pool.token_mint_b.as_ref(),
            &pool.tick_spacing.to_le_bytes()
        ],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(
        init,
        seeds = [
            TICK_ARRAY_SEED.as_bytes(),
            pool.key().as_ref(),
            &start_tick_index.to_le_bytes()
        ],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<TickArray>() + 4 + TICK_ARRAY_SIZE * std::mem::size_of::<crate::state::Tick>()
    )]
    pub tick_array: Account<'info, TickArray>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeTickArray>,
    start_tick_index: i32,
) -> Result<()> {
    // Validate start tick index
    let tick_spacing = ctx.accounts.pool.tick_spacing;
    let expected_start_tick = get_tick_array_start_index(start_tick_index, tick_spacing, TICK_ARRAY_SIZE);
    
    if expected_start_tick != start_tick_index {
        return Err(PoolError::InvalidTickIndex.into());
    }
    
    // Initialize tick array
    let tick_array = &mut ctx.accounts.tick_array;
    tick_array.bump = ctx.bumps.tick_array;
    tick_array.pool = ctx.accounts.pool.key();
    tick_array.start_tick_index = start_tick_index;
    
    // Initialize empty ticks
    tick_array.ticks = vec![crate::state::Tick::default(); TICK_ARRAY_SIZE];
    
    // Emit event
    emit!(TickArrayCreatedEvent {
        pool_id: ctx.accounts.pool.key(),
        start_tick_index,
    });
    
    Ok(())
}

use crate::constants::POOL_SEED; 