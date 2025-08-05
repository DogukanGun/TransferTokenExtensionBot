use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;
use spl_tlv_account_resolution::{
    account::ExtraAccountMeta, 
    seeds::Seed, 
    state::ExtraAccountMetaList
};

use crate::state::TokenInfo;

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    /// CHECK: ExtraAccountMetaList Account, must use these seeds
    #[account(
        init,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump,
        space = ExtraAccountMetaList::size_of(
            InitializeExtraAccountMetaList::extra_account_metas()?.len()
        )?,
        payer = payer
    )]
    pub extra_account_meta_list: AccountInfo<'info>,
    #[account(
        init_if_needed,
        seeds = [b"token-info", mint.key().as_ref()],
        bump,
        space = TokenInfo::INIT_SPACE,
        payer = payer
    )]
    pub token_info: Account<'info, TokenInfo>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitializeExtraAccountMetaList<'info> {
    pub fn extra_account_metas() -> Result<Vec<ExtraAccountMeta>> {
        Ok(
            vec![
                ExtraAccountMeta::new_with_seeds(
                    &[
                        Seed::Literal {
                            bytes: b"whitelist".to_vec(),
                        },
                    ],
                    false, // is_signer
                    false // is_writable
                )?
            ]
        )
    }

    pub fn initialize_token_info(
        &mut self, 
        bumps: InitializeExtraAccountMetaListBumps,
        token_name: String,
        token_symbol: String,
        token_total_supply: u64,
        is_whale_enabled: bool,
        is_whitelist_enabled: bool,
        is_total_transfer_amount_enabled: bool,
        whale_amount: u64,
        total_transfer_amount: u64,
    ) -> Result<()> {
        
        self.token_info.set_inner(TokenInfo {
            token_address: self.mint.key(),
            token_name: token_name,
            token_symbol: token_symbol,
            token_decimals: self.mint.decimals,
            token_total_supply: token_total_supply,
            token_mint: self.mint.key(),
            token_creator: self.payer.key(),
            is_whale_enabled,
            is_whitelist_enabled,
            is_total_transfer_amount_enabled,
            whale_amount,
            total_transfer_amount,
            whitelist_addresses: vec![],
            bump: bumps.token_info,
        });

        Ok(())
    }
}