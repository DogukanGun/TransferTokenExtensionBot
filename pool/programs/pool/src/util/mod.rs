use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RemainingAccountsInfo {
    pub transfer_hook_enabled: bool,
    pub transfer_hook_program_index: u8,
    pub transfer_hook_extra_account_indices: Vec<u8>,
} 