use std::cell::RefMut;
use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022::spl_token_2022::{
        extension::{
            transfer_hook::TransferHookAccount,
            BaseStateWithExtensionsMut,
            PodStateWithExtensionsMut,
        },
        pod::PodAccount,
    },
    token_interface::{Mint, TokenAccount},
};

use crate::{
    state::TokenInfo,
    errors::CustomError,
    events::WhaleTransferEvent,
};

#[derive(Accounts)]
pub struct TransferHook<'info> {
    #[account(
        token::mint = mint, 
        token::authority = owner,
    )]
    pub source_token: InterfaceAccount<'info, TokenAccount>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        token::mint = mint,
    )]
    pub destination_token: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: Owner can be a SystemAccount or PDA
    pub owner: UncheckedAccount<'info>,

    /// Token info holds whitelist, whale settings, and transfer limits
    #[account(
        seeds = [b"token-info", mint.key().as_ref()],
        bump = token_info.bump,
    )]
    pub token_info: Account<'info, TokenInfo>,

    /// CHECK: ExtraAccountMetaList Account
    #[account(
        seeds = [b"extra-account-metas", mint.key().as_ref()], 
        bump
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,
}

impl<'info> TransferHook<'info> {
    /// Called during token transfer
    pub fn transfer_hook(&mut self, amount: u64) -> Result<()> {
        self.check_is_transferring()?;

        let ti = &self.token_info;

        // 1) Enforce whitelist
        if ti.is_whitelist_enabled && !ti.whitelist_addresses.contains(&self.owner.key()) {
            return err!(CustomError::NotWhitelisted);
        }

        // 2) Enforce max single transfer limit
        if ti.is_total_transfer_amount_enabled && amount > ti.total_transfer_amount {
            return err!(CustomError::TransferLimitExceeded);
        }

        // 3) Whale detection event
        if ti.is_whale_enabled && amount >= ti.whale_amount {
            emit!(WhaleTransferEvent {
                whale_address: self.owner.key(),
                transfer_amount: amount,
            });
        }

        Ok(())
    }

    fn check_is_transferring(&mut self) -> Result<()> {
        let source_token_info = self.source_token.to_account_info();
        let mut data_ref: RefMut<&mut [u8]> = source_token_info.try_borrow_mut_data()?;
        let mut account = PodStateWithExtensionsMut::<PodAccount>::unpack(*data_ref)?;
        let ext = account.get_extension_mut::<TransferHookAccount>()?;

        if !bool::from(ext.transferring) {
            return err!(CustomError::NotInTransferHook);
        }

        Ok(())
    }
}