use anchor_lang::prelude::*;

#[event]
pub struct WhaleTransferEvent {
    pub whale_address: Pubkey,
    pub transfer_amount: u64,
}