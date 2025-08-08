use anchor_lang::prelude::*;
use crate::errors::PoolError;

pub fn get_amount_delta_a(
    sqrt_price_0: u128,
    sqrt_price_1: u128,
    liquidity: u128,
    round_up: bool,
) -> Result<u64> {
    // Ensure sqrt_price_0 and sqrt_price_1 are valid
    if sqrt_price_0 > sqrt_price_1 {
        return get_amount_delta_a(sqrt_price_1, sqrt_price_0, liquidity, !round_up);
    }
    
    let numerator = liquidity << 64;
    let denominator_0 = sqrt_price_0;
    let denominator_1 = sqrt_price_1;
    
    let amount = if denominator_1 == denominator_0 {
        0
    } else {
        let amount_0 = numerator / denominator_0;
        let amount_1 = numerator / denominator_1;
        
        if round_up {
            amount_0.checked_sub(amount_1).ok_or(PoolError::LiquidityOverflow)?
        } else {
            amount_0.checked_sub(amount_1).ok_or(PoolError::LiquidityOverflow)?
        }
    };
    
    Ok(amount.try_into().map_err(|_| PoolError::LiquidityOverflow)?)
}

pub fn get_amount_delta_b(
    sqrt_price_0: u128,
    sqrt_price_1: u128,
    liquidity: u128,
    round_up: bool,
) -> Result<u64> {
    // Ensure sqrt_price_0 and sqrt_price_1 are valid
    if sqrt_price_0 > sqrt_price_1 {
        return get_amount_delta_b(sqrt_price_1, sqrt_price_0, liquidity, !round_up);
    }
    
    let amount = if liquidity == 0 {
        0
    } else {
        let amount = sqrt_price_1
            .checked_sub(sqrt_price_0)
            .ok_or(PoolError::LiquidityOverflow)?
            .checked_mul(liquidity)
            .ok_or(PoolError::LiquidityOverflow)?
            .checked_shr(64)
            .ok_or(PoolError::LiquidityOverflow)?;
            
        if round_up && amount > 0 {
            amount.checked_add(1).ok_or(PoolError::LiquidityOverflow)?
        } else {
            amount
        }
    };
    
    Ok(amount.try_into().map_err(|_| PoolError::LiquidityOverflow)?)
} 