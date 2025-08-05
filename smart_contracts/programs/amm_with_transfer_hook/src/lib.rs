use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

declare_id!("F4RupoT7DMW6dDbkzoyG3R3LndyW9EJEeBp4FvMu9v56");

#[program]
pub mod amm_with_transfer_hook {
    use super::*;

    pub fn initialize_token_info(
        ctx: Context<InitializeExtraAccountMetaList>,
        token_name: String,
        token_symbol: String,
        token_total_supply: u64,
        is_whale_enabled: bool,
        is_whitelist_enabled: bool,
        is_total_transfer_amount_enabled: bool,
        whale_amount: u64,
        total_transfer_amount: u64,
    ) -> Result<()> {
        ctx.accounts.initialize_token_info(
            ctx.bumps,
            token_name,
            token_symbol,
            token_total_supply,
            is_whale_enabled,
            is_whitelist_enabled,
            is_total_transfer_amount_enabled,
            whale_amount,
            total_transfer_amount,
        )
    }

    pub fn add_to_whitelist(ctx: Context<UpdateTokenExtension>, new_address: Pubkey) -> Result<()> {
        ctx.accounts.add_to_whitelist(new_address)
    }

    pub fn set_max_transfer_limit(ctx: Context<UpdateTokenExtension>, limit: u64) -> Result<()> {
        ctx.accounts.set_max_transfer_limit(limit)
    }

    pub fn update_whale_alert(
        ctx: Context<UpdateTokenExtension>,
        enable: bool,
        amount: u64,
    ) -> Result<()> {
        ctx.accounts.update_whale_alert(enable, amount)
    }

    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        ctx.accounts.transfer_hook(amount)
    }
}
