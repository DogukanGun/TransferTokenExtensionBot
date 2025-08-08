use anchor_lang::prelude::*;
use crate::errors::PoolError;

pub fn calculate_fee_amount(amount: u64, fee_rate: u16) -> Result<u64> {
    let fee_amount = (amount as u128)
        .checked_mul(fee_rate as u128)
        .ok_or(PoolError::LiquidityOverflow)?
        .checked_div(1_000_000)
        .ok_or(PoolError::LiquidityOverflow)?;
        
    Ok(fee_amount as u64)
}

pub fn calculate_protocol_fee(fee_amount: u64, protocol_fee_rate: u16) -> Result<u64> {
    let protocol_fee = (fee_amount as u128)
        .checked_mul(protocol_fee_rate as u128)
        .ok_or(PoolError::LiquidityOverflow)?
        .checked_div(10_000)
        .ok_or(PoolError::LiquidityOverflow)?;
        
    Ok(protocol_fee as u64)
} 