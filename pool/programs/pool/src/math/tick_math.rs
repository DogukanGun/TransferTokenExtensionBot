use anchor_lang::prelude::*;
use crate::{constants::{MAX_TICK_INDEX, MIN_TICK_INDEX}, errors::PoolError};

pub fn validate_tick_index(tick_index: i32, tick_spacing: u16) -> Result<()> {
    if tick_index % tick_spacing as i32 != 0 {
        return Err(PoolError::InvalidTickIndex.into());
    }
    
    if tick_index > MAX_TICK_INDEX || tick_index < MIN_TICK_INDEX {
        return Err(PoolError::InvalidTickIndex.into());
    }
    
    Ok(())
}

pub fn check_tick_in_bounds(tick_index: i32) -> Result<()> {
    if tick_index > MAX_TICK_INDEX || tick_index < MIN_TICK_INDEX {
        return Err(PoolError::InvalidTickIndex.into());
    }
    
    Ok(())
}

pub fn get_tick_array_start_index(tick_index: i32, tick_spacing: u16, array_size: usize) -> i32 {
    let ticks_in_array = (array_size as i32) * (tick_spacing as i32);
    tick_index - (tick_index % ticks_in_array)
}

pub fn is_tick_initialized(tick_bitmap: u128, tick_index: i32) -> bool {
    let bit_pos = tick_index % 128;
    let mask = 1u128 << (bit_pos as u32);
    (tick_bitmap & mask) != 0
} 