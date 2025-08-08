use anchor_lang::prelude::*;

#[error_code]
pub enum PoolError {
    #[msg("Invalid token mint order")]
    InvalidTokenMintOrder,
    
    #[msg("Square root price out of bounds")]
    SqrtPriceOutOfBounds,
    
    #[msg("Liquidity amount must be greater than zero")]
    LiquidityZero,
    
    #[msg("Liquidity amount too high")]
    LiquidityTooHigh,
    
    #[msg("Token maximum exceeded")]
    TokenMaxExceeded,
    
    #[msg("Token minimum not met")]
    TokenMinSubceeded,
    
    #[msg("Invalid tick index")]
    InvalidTickIndex,
    
    #[msg("Invalid tick spacing")]
    InvalidTickSpacing,
    
    #[msg("Invalid fee rate")]
    FeeRateMaxExceeded,
    
    #[msg("Invalid protocol fee rate")]
    ProtocolFeeRateMaxExceeded,
    
    #[msg("Position not empty")]
    ClosePositionNotEmpty,
    
    #[msg("Zero tradable amount")]
    ZeroTradableAmount,
    
    #[msg("Invalid sqrt price limit direction")]
    InvalidSqrtPriceLimitDirection,
    
    #[msg("Invalid tick array sequence")]
    InvalidTickArraySequence,
    
    #[msg("Tick array sequence invalid index")]
    TickArraySequenceInvalidIndex,
    
    #[msg("Tick array index out of bounds")]
    TickArrayIndexOutOfBounds,
    
    #[msg("Liquidity overflow")]
    LiquidityOverflow,
    
    #[msg("Invalid reward index")]
    InvalidRewardIndex,
    
    #[msg("Reward vault amount insufficient")]
    RewardVaultAmountInsufficient,
    
    #[msg("Invalid timestamp")]
    InvalidTimestamp,
    
    #[msg("Position already locked")]
    PositionAlreadyLocked,
    
    #[msg("Position not lockable")]
    PositionNotLockable,
    
    #[msg("Same tick range not allowed")]
    SameTickRangeNotAllowed,
} 