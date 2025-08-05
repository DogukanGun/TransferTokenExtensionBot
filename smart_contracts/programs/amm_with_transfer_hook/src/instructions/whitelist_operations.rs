use anchor_lang::{prelude::*, system_program};

use crate::state::TokenInfo;

#[derive(Accounts)]
pub struct TokenInfoWhitelistOps<'info> {
    #[account(
        mut,
        has_one = token_creator,
        seeds = [b"token-info", token_info.token_mint.as_ref()],
        bump = token_info.bump
    )]
    pub token_info: Account<'info, TokenInfo>,

    pub token_creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> TokenInfoWhitelistOps<'info> {
    pub fn add_to_whitelist(&mut self, address: Pubkey) -> Result<()> {
        if !self.token_info.whitelist_addresses.contains(&address) {
            self.realloc_token_info(true)?;
            self.token_info.whitelist_addresses.push(address);
        }
        Ok(())
    }

    pub fn remove_from_whitelist(&mut self, address: Pubkey) -> Result<()> {
        if let Some(pos) = self
            .token_info
            .whitelist_addresses
            .iter()
            .position(|&x| x == address)
        {
            self.token_info.whitelist_addresses.remove(pos);
            self.realloc_token_info(false)?;
        }
        Ok(())
    }

    fn realloc_token_info(&mut self, is_adding: bool) -> Result<()> {
        let account_info = self.token_info.to_account_info();
        let pubkey_size = std::mem::size_of::<Pubkey>();

        // 4-byte vec length prefix is constant, so adjust only for element size
        let new_size = if is_adding {
            account_info.data_len() + pubkey_size
        } else {
            account_info.data_len().saturating_sub(pubkey_size)
        };

        // Calculate required rent
        let rent = Rent::get()?;
        let lamports_required = rent.minimum_balance(new_size);

        if is_adding {
            let rent_diff = lamports_required.saturating_sub(account_info.lamports());
            if rent_diff > 0 {
                // Top up account lamports
                let cpi_accounts = system_program::Transfer {
                    from: self.token_creator.to_account_info(),
                    to: account_info.clone(),
                };
                let cpi_ctx =
                    CpiContext::new(self.system_program.to_account_info(), cpi_accounts);
                system_program::transfer(cpi_ctx, rent_diff)?;
            }
            account_info.realloc(new_size, false)?;
            msg!("TokenInfo expanded to {} bytes", new_size);
        } else {
            // Shrinking: refund rent
            account_info.realloc(new_size, false)?;
            let refund = account_info.lamports() - lamports_required;
            if refund > 0 {
                **self.token_creator.to_account_info().try_borrow_mut_lamports()? += refund;
                **account_info.try_borrow_mut_lamports()? -= refund;
            }
            msg!("TokenInfo shrunk to {} bytes", new_size);
        }

        Ok(())
    }
}