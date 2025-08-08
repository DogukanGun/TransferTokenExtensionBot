use anchor_lang::prelude::*;
use crate::errors::PoolError;

pub fn add_delta(x: u128, y: i128) -> Result<u128> {
    if y < 0 {
        let y_abs = y.unsigned_abs();
        if y_abs > x {
            return Err(PoolError::LiquidityOverflow.into());
        }
        Ok(x - y_abs)
    } else {
        x.checked_add(y as u128).ok_or(PoolError::LiquidityOverflow.into())
    }
}

pub fn get_liquidity_from_amounts(
    sqrt_price: u128,
    sqrt_price_lower: u128,
    sqrt_price_upper: u128,
    amount_a: u64,
    amount_b: u64,
) -> Result<u128> {
    if sqrt_price <= sqrt_price_lower {
        // All liquidity from token A
        let liquidity = (amount_a as u128)
            .checked_mul(sqrt_price_lower)
            .ok_or(PoolError::LiquidityOverflow)?
            .checked_shr(64)
            .ok_or(PoolError::LiquidityOverflow)?;
        Ok(liquidity)
    } else if sqrt_price < sqrt_price_upper {
        // Liquidity from both tokens
        let liquidity_a = (amount_a as u128)
            .checked_mul(sqrt_price)
            .ok_or(PoolError::LiquidityOverflow)?
            .checked_shr(64)
            .ok_or(PoolError::LiquidityOverflow)?;
            
        let liquidity_b = (amount_b as u128)
            .checked_shl(64)
            .ok_or(PoolError::LiquidityOverflow)?
            .checked_div(sqrt_price_upper - sqrt_price)
            .ok_or(PoolError::LiquidityOverflow)?;
            
        Ok(std::cmp::min(liquidity_a, liquidity_b))
    } else {
        // All liquidity from token B
        let liquidity = (amount_b as u128)
            .checked_shl(64)
            .ok_or(PoolError::LiquidityOverflow)?
            .checked_div(sqrt_price_upper - sqrt_price_lower)
            .ok_or(PoolError::LiquidityOverflow)?;
        Ok(liquidity)
    }
} 