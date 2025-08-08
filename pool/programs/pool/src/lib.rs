use anchor_lang::prelude::*;

declare_id!("ATjeowb5mBhPDtRiUAstjDVkCNGYyyP5Wze3P1C2WqC9");

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod manager;
pub mod math;
pub mod state;
pub mod util;

use crate::state::WhirlpoolBumps;
use instructions::*;

#[program]
pub mod pool {
    use super::*;

    /// Initializes a PoolConfig account that hosts info & authorities
    /// required to govern a set of Pools.
    ///
    /// ### Parameters
    /// - `fee_authority` - Authority authorized to initialize fee-tiers and set customs fees.
    /// - `collect_protocol_fees_authority` - Authority authorized to collect protocol fees.
    /// - `reward_emissions_super_authority` - Authority authorized to set reward authorities in pools.
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        fee_authority: Pubkey,
        collect_protocol_fees_authority: Pubkey,
        reward_emissions_super_authority: Pubkey,
        default_protocol_fee_rate: u16,
    ) -> Result<()> {
        instructions::initialize_config::handler(
            ctx,
            fee_authority,
            collect_protocol_fees_authority,
            reward_emissions_super_authority,
            default_protocol_fee_rate,
        )
    }

    /// Initializes a Pool account.
    /// Fee rate is set to the default values on the config and supplied fee_tier.
    ///
    /// ### Parameters
    /// - `bumps` - The bump value when deriving the PDA of the Pool address.
    /// - `tick_spacing` - The desired tick spacing for this pool.
    /// - `initial_sqrt_price` - The desired initial sqrt-price for this pool
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        bumps: WhirlpoolBumps,
        tick_spacing: u16,
        initial_sqrt_price: u128,
    ) -> Result<()> {
        instructions::initialize_pool::handler(ctx, bumps, tick_spacing, initial_sqrt_price)
    }
    
    /// Initializes a fixed-length tick_array account to represent a tick-range in a Pool.
    ///
    /// ### Parameters
    /// - `start_tick_index` - The starting tick index for this tick-array.
    ///                        Has to be a multiple of TickArray size & the tick spacing of this pool.
    pub fn initialize_tick_array(
        ctx: Context<InitializeTickArray>,
        start_tick_index: i32,
    ) -> Result<()> {
        instructions::initialize_tick_array::handler(ctx, start_tick_index)
    }
    
    /// Initializes a fee_tier account usable by Pools in a PoolConfig space.
    ///
    /// ### Authority
    /// - "fee_authority" - Set authority in the PoolConfig
    ///
    /// ### Parameters
    /// - `tick_spacing` - The tick-spacing that this fee-tier suggests the default_fee_rate for.
    /// - `default_fee_rate` - The default fee rate that a pool will use if the pool uses this
    ///                        fee tier during initialization.
    pub fn initialize_fee_tier(
        ctx: Context<InitializeFeeTier>,
        tick_spacing: u16,
        default_fee_rate: u16,
    ) -> Result<()> {
        instructions::initialize_fee_tier::handler(ctx, tick_spacing, default_fee_rate)
    }
}
