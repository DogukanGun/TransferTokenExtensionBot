use anchor_lang::prelude::*;

pub const MAX_WHITELIST: usize = 50;

#[account]
pub struct TokenInfo {
    pub token_address: Pubkey,
    pub token_name: String,
    pub token_symbol: String,
    pub token_decimals: u8,
    pub token_total_supply: u64,
    pub token_mint: Pubkey,
    pub token_creator: Pubkey,
    pub is_whale_enabled: bool,
    pub is_whitelist_enabled: bool,
    pub is_total_transfer_amount_enabled: bool,
    pub whale_amount: u64,
    pub total_transfer_amount: u64,
    pub whitelist_addresses: Vec<Pubkey>,
    pub bump: u8,
}

impl TokenInfo {
    pub const INIT_SPACE: usize = 8 + 32 + 4 + 10 + 1 + 8 + 32 + 32 + 1 + 1 + 1 + 8 + 8 + 4 + (32 * MAX_WHITELIST) + 1;
}
