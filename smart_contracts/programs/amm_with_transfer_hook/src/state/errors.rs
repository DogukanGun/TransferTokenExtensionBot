use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("TransferHook: Owner not whitelisted")]
    NotWhitelisted,
    #[msg("TransferHook: Transfer amount exceeds allowed maximum")]
    TransferLimitExceeded,
    #[msg("TransferHook: Not called during transfer hook")]
    NotInTransferHook,
    #[msg("TransferHook: Whitelist is disabled")]
    WhitelistDisabled,
}