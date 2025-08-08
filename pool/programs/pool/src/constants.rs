use anchor_lang::prelude::*;

pub const POOL_SEED: &str = "pool";
pub const POSITION_SEED: &str = "position";
pub const TICK_ARRAY_SEED: &str = "tick_array";
pub const POSITION_BUNDLE_SEED: &str = "position_bundle";
pub const FEE_TIER_SEED: &str = "fee_tier";
pub const ORACLE_SEED: &str = "oracle";
pub const CONFIG_SEED: &str = "config";

pub const MAX_TICK_INDEX: i32 = 443636;
pub const MIN_TICK_INDEX: i32 = -443636;

pub const TICK_ARRAY_SIZE: usize = 88;

pub const MAX_FEE_RATE: u16 = 10_000; // 1%
pub const MAX_PROTOCOL_FEE_RATE: u16 = 10_000; // 100%

pub const NUM_REWARDS: usize = 3;

// Minimum sqrt price: 2^-64
pub const MIN_SQRT_PRICE: u128 = 1;
// Maximum sqrt price: 2^64
pub const MAX_SQRT_PRICE: u128 = 18446744073709551615;

// Minimum tick spacing: 1
pub const MIN_TICK_SPACING: u16 = 1;
// Maximum tick spacing: 100
pub const MAX_TICK_SPACING: u16 = 100;

// Maximum positions per bundle
pub const MAX_POSITIONS_PER_BUNDLE: usize = 100;

// Minimum liquidity per tick
pub const MIN_LIQUIDITY_PER_TICK: u128 = 1; 