use anchor_lang::prelude::*;

mod pool;
mod position;
mod tick;
mod tick_array;
mod config;
mod fee_tier;
mod reward;

pub use pool::*;
pub use position::*;
pub use tick::*;
pub use tick_array::*;
pub use config::*;
pub use fee_tier::*;
pub use reward::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct WhirlpoolBumps {
    pub pool_bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct OpenPositionBumps {
    pub position_bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct OpenPositionWithMetadataBumps {
    pub position_bump: u8,
    pub metadata_bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum LockType {
    #[default]
    None = 0,
    Temporary = 1,
    Permanent = 2,
} 