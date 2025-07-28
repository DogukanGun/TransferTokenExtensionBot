use anchor_lang::prelude::*;

use crate::state::{CustomError, TokenInfo};


#[derive(Accounts)]
pub struct UpdateTokenExtension<'info> {
    #[account(mut, has_one = token_creator)]
    pub token_info: Account<'info, TokenInfo>,
    pub token_creator: Signer<'info>,
}

impl<'info> UpdateTokenExtension<'info> {
    pub fn add_to_whitelist(&mut self, new_address: Pubkey) -> Result<()> {
        let token_info = &mut self.token_info;

        require!(token_info.is_whitelist_enabled, CustomError::WhitelistDisabled);

        if !token_info.whitelist_addresses.contains(&new_address) {
            token_info.whitelist_addresses.push(new_address);
        }

        Ok(())
    }

    pub fn set_max_transfer_limit(&mut self, limit: u64) -> Result<()> {
        let token_info = &mut self.token_info;
        token_info.is_total_transfer_amount_enabled = true;
        token_info.total_transfer_amount = limit;
        Ok(())
    }

    pub fn update_whale_alert(&mut self, enable: bool, amount: u64) -> Result<()> {
        let token_info = &mut self.token_info;
        token_info.is_whale_enabled = enable;
        token_info.whale_amount = amount;
        Ok(())
    }
}