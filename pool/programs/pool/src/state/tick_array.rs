use anchor_lang::prelude::*;
use crate::{constants::TICK_ARRAY_SIZE, state::Tick};

#[account]
#[derive(Default)]
pub struct TickArray {
    // Bump to identify PDA
    pub bump: u8,
    
    // Pool this tick array belongs to
    pub pool: Pubkey,
    
    // Starting tick index of this array
    pub start_tick_index: i32,
    
    // Ticks in this array - using Vec instead of fixed array for Default implementation
    pub ticks: Vec<Tick>,
} 