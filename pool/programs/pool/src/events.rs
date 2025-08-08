use anchor_lang::prelude::*;

#[event]
pub struct PoolCreatedEvent {
    pub pool_id: Pubkey,
    pub token_mint_a: Pubkey,
    pub token_mint_b: Pubkey,
    pub tick_spacing: u16,
    pub initial_sqrt_price: u128,
}

#[event]
pub struct PositionCreatedEvent {
    pub position_id: Pubkey,
    pub pool_id: Pubkey,
    pub owner: Pubkey,
    pub tick_lower_index: i32,
    pub tick_upper_index: i32,
}

#[event]
pub struct LiquidityChangedEvent {
    pub position_id: Pubkey,
    pub liquidity_before: u128,
    pub liquidity_after: u128,
}

#[event]
pub struct SwapEvent {
    pub pool_id: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub fee_amount: u64,
    pub a_to_b: bool,
}

#[event]
pub struct FeesCollectedEvent {
    pub position_id: Pubkey,
    pub fee_amount_a: u64,
    pub fee_amount_b: u64,
}

#[event]
pub struct ProtocolFeesCollectedEvent {
    pub pool_id: Pubkey,
    pub protocol_fee_amount_a: u64,
    pub protocol_fee_amount_b: u64,
}

#[event]
pub struct RewardInitializedEvent {
    pub pool_id: Pubkey,
    pub reward_index: u8,
    pub reward_mint: Pubkey,
}

#[event]
pub struct RewardEmissionsChangedEvent {
    pub pool_id: Pubkey,
    pub reward_index: u8,
    pub emissions_per_second_x64: u128,
}

#[event]
pub struct RewardCollectedEvent {
    pub position_id: Pubkey,
    pub reward_index: u8,
    pub reward_amount: u64,
}

#[event]
pub struct PositionClosedEvent {
    pub position_id: Pubkey,
}

#[event]
pub struct TickArrayCreatedEvent {
    pub pool_id: Pubkey,
    pub start_tick_index: i32,
}

#[event]
pub struct FeeRateChangedEvent {
    pub pool_id: Pubkey,
    pub fee_rate: u16,
}

#[event]
pub struct ProtocolFeeRateChangedEvent {
    pub pool_id: Pubkey,
    pub protocol_fee_rate: u16,
}

#[event]
pub struct PositionLockEvent {
    pub position_id: Pubkey,
    pub lock_type: u8,
}

#[event]
pub struct PositionRangeResetEvent {
    pub position_id: Pubkey,
    pub tick_lower_index_before: i32,
    pub tick_upper_index_before: i32,
    pub tick_lower_index_after: i32,
    pub tick_upper_index_after: i32,
} 