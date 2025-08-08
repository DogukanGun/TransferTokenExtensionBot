/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pool.json`.
 */
export type Pool = {
  "address": "ATjeowb5mBhPDtRiUAstjDVkCNGYyyP5Wze3P1C2WqC9",
  "metadata": {
    "name": "pool",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeConfig",
      "docs": [
        "Initializes a PoolConfig account that hosts info & authorities",
        "required to govern a set of Pools.",
        "",
        "### Parameters",
        "- `fee_authority` - Authority authorized to initialize fee-tiers and set customs fees.",
        "- `collect_protocol_fees_authority` - Authority authorized to collect protocol fees.",
        "- `reward_emissions_super_authority` - Authority authorized to set reward authorities in pools."
      ],
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "feeAuthority",
          "type": "pubkey"
        },
        {
          "name": "collectProtocolFeesAuthority",
          "type": "pubkey"
        },
        {
          "name": "rewardEmissionsSuperAuthority",
          "type": "pubkey"
        },
        {
          "name": "defaultProtocolFeeRate",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeFeeTier",
      "docs": [
        "Initializes a fee_tier account usable by Pools in a PoolConfig space.",
        "",
        "### Authority",
        "- \"fee_authority\" - Set authority in the PoolConfig",
        "",
        "### Parameters",
        "- `tick_spacing` - The tick-spacing that this fee-tier suggests the default_fee_rate for.",
        "- `default_fee_rate` - The default fee rate that a pool will use if the pool uses this",
        "fee tier during initialization."
      ],
      "discriminator": [
        183,
        74,
        156,
        160,
        112,
        2,
        42,
        30
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeAuthority",
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "feeTier",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  116,
                  105,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "arg",
                "path": "tickSpacing"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tickSpacing",
          "type": "u16"
        },
        {
          "name": "defaultFeeRate",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializePool",
      "docs": [
        "Initializes a Pool account.",
        "Fee rate is set to the default values on the config and supplied fee_tier.",
        "",
        "### Parameters",
        "- `bumps` - The bump value when deriving the PDA of the Pool address.",
        "- `tick_spacing` - The desired tick spacing for this pool.",
        "- `initial_sqrt_price` - The desired initial sqrt-price for this pool"
      ],
      "discriminator": [
        95,
        180,
        10,
        172,
        84,
        174,
        232,
        40
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMintA"
        },
        {
          "name": "tokenMintB"
        },
        {
          "name": "tokenVaultA",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenVaultB",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "feeTier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  116,
                  105,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "arg",
                "path": "tickSpacing"
              }
            ]
          }
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMintA"
              },
              {
                "kind": "account",
                "path": "tokenMintB"
              },
              {
                "kind": "arg",
                "path": "tickSpacing"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "bumps",
          "type": {
            "defined": {
              "name": "whirlpoolBumps"
            }
          }
        },
        {
          "name": "tickSpacing",
          "type": "u16"
        },
        {
          "name": "initialSqrtPrice",
          "type": "u128"
        }
      ]
    },
    {
      "name": "initializeTickArray",
      "docs": [
        "Initializes a fixed-length tick_array account to represent a tick-range in a Pool.",
        "",
        "### Parameters",
        "- `start_tick_index` - The starting tick index for this tick-array.",
        "Has to be a multiple of TickArray size & the tick spacing of this pool."
      ],
      "discriminator": [
        11,
        188,
        193,
        214,
        141,
        91,
        149,
        184
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "pool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.token_mint_a",
                "account": "pool"
              },
              {
                "kind": "account",
                "path": "pool.token_mint_b",
                "account": "pool"
              },
              {
                "kind": "account",
                "path": "pool.tick_spacing",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "tickArray",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  99,
                  107,
                  95,
                  97,
                  114,
                  114,
                  97,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "arg",
                "path": "startTickIndex"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "startTickIndex",
          "type": "i32"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "feeTier",
      "discriminator": [
        56,
        75,
        159,
        76,
        142,
        68,
        190,
        105
      ]
    },
    {
      "name": "pool",
      "discriminator": [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188
      ]
    },
    {
      "name": "poolConfig",
      "discriminator": [
        26,
        108,
        14,
        123,
        116,
        230,
        129,
        43
      ]
    },
    {
      "name": "tickArray",
      "discriminator": [
        69,
        97,
        189,
        190,
        110,
        7,
        66,
        187
      ]
    }
  ],
  "events": [
    {
      "name": "feeRateChangedEvent",
      "discriminator": [
        198,
        44,
        78,
        81,
        101,
        68,
        130,
        79
      ]
    },
    {
      "name": "feesCollectedEvent",
      "discriminator": [
        228,
        238,
        55,
        219,
        37,
        85,
        82,
        54
      ]
    },
    {
      "name": "liquidityChangedEvent",
      "discriminator": [
        244,
        240,
        23,
        67,
        33,
        67,
        185,
        125
      ]
    },
    {
      "name": "poolCreatedEvent",
      "discriminator": [
        25,
        94,
        75,
        47,
        112,
        99,
        53,
        63
      ]
    },
    {
      "name": "positionClosedEvent",
      "discriminator": [
        76,
        129,
        10,
        225,
        238,
        51,
        158,
        126
      ]
    },
    {
      "name": "positionCreatedEvent",
      "discriminator": [
        42,
        70,
        176,
        217,
        209,
        232,
        121,
        155
      ]
    },
    {
      "name": "positionLockEvent",
      "discriminator": [
        23,
        229,
        143,
        87,
        27,
        126,
        36,
        78
      ]
    },
    {
      "name": "positionRangeResetEvent",
      "discriminator": [
        19,
        222,
        242,
        75,
        224,
        111,
        134,
        125
      ]
    },
    {
      "name": "protocolFeeRateChangedEvent",
      "discriminator": [
        74,
        76,
        144,
        136,
        227,
        239,
        223,
        170
      ]
    },
    {
      "name": "protocolFeesCollectedEvent",
      "discriminator": [
        43,
        213,
        133,
        149,
        103,
        13,
        188,
        38
      ]
    },
    {
      "name": "rewardCollectedEvent",
      "discriminator": [
        241,
        95,
        182,
        205,
        45,
        202,
        7,
        79
      ]
    },
    {
      "name": "rewardEmissionsChangedEvent",
      "discriminator": [
        65,
        250,
        23,
        29,
        126,
        77,
        167,
        198
      ]
    },
    {
      "name": "rewardInitializedEvent",
      "discriminator": [
        219,
        146,
        100,
        186,
        124,
        253,
        237,
        33
      ]
    },
    {
      "name": "swapEvent",
      "discriminator": [
        64,
        198,
        205,
        232,
        38,
        8,
        113,
        226
      ]
    },
    {
      "name": "tickArrayCreatedEvent",
      "discriminator": [
        183,
        29,
        216,
        187,
        64,
        92,
        128,
        88
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidTokenMintOrder",
      "msg": "Invalid token mint order"
    },
    {
      "code": 6001,
      "name": "sqrtPriceOutOfBounds",
      "msg": "Square root price out of bounds"
    },
    {
      "code": 6002,
      "name": "liquidityZero",
      "msg": "Liquidity amount must be greater than zero"
    },
    {
      "code": 6003,
      "name": "liquidityTooHigh",
      "msg": "Liquidity amount too high"
    },
    {
      "code": 6004,
      "name": "tokenMaxExceeded",
      "msg": "Token maximum exceeded"
    },
    {
      "code": 6005,
      "name": "tokenMinSubceeded",
      "msg": "Token minimum not met"
    },
    {
      "code": 6006,
      "name": "invalidTickIndex",
      "msg": "Invalid tick index"
    },
    {
      "code": 6007,
      "name": "invalidTickSpacing",
      "msg": "Invalid tick spacing"
    },
    {
      "code": 6008,
      "name": "feeRateMaxExceeded",
      "msg": "Invalid fee rate"
    },
    {
      "code": 6009,
      "name": "protocolFeeRateMaxExceeded",
      "msg": "Invalid protocol fee rate"
    },
    {
      "code": 6010,
      "name": "closePositionNotEmpty",
      "msg": "Position not empty"
    },
    {
      "code": 6011,
      "name": "zeroTradableAmount",
      "msg": "Zero tradable amount"
    },
    {
      "code": 6012,
      "name": "invalidSqrtPriceLimitDirection",
      "msg": "Invalid sqrt price limit direction"
    },
    {
      "code": 6013,
      "name": "invalidTickArraySequence",
      "msg": "Invalid tick array sequence"
    },
    {
      "code": 6014,
      "name": "tickArraySequenceInvalidIndex",
      "msg": "Tick array sequence invalid index"
    },
    {
      "code": 6015,
      "name": "tickArrayIndexOutOfBounds",
      "msg": "Tick array index out of bounds"
    },
    {
      "code": 6016,
      "name": "liquidityOverflow",
      "msg": "Liquidity overflow"
    },
    {
      "code": 6017,
      "name": "invalidRewardIndex",
      "msg": "Invalid reward index"
    },
    {
      "code": 6018,
      "name": "rewardVaultAmountInsufficient",
      "msg": "Reward vault amount insufficient"
    },
    {
      "code": 6019,
      "name": "invalidTimestamp",
      "msg": "Invalid timestamp"
    },
    {
      "code": 6020,
      "name": "positionAlreadyLocked",
      "msg": "Position already locked"
    },
    {
      "code": 6021,
      "name": "positionNotLockable",
      "msg": "Position not lockable"
    },
    {
      "code": 6022,
      "name": "sameTickRangeNotAllowed",
      "msg": "Same tick range not allowed"
    }
  ],
  "types": [
    {
      "name": "feeRateChangedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "pubkey"
          },
          {
            "name": "feeRate",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "feeTier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "tickSpacing",
            "type": "u16"
          },
          {
            "name": "defaultFeeRate",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "feesCollectedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "positionId",
            "type": "pubkey"
          },
          {
            "name": "feeAmountA",
            "type": "u64"
          },
          {
            "name": "feeAmountB",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "liquidityChangedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "positionId",
            "type": "pubkey"
          },
          {
            "name": "liquidityBefore",
            "type": "u128"
          },
          {
            "name": "liquidityAfter",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "tokenMintA",
            "type": "pubkey"
          },
          {
            "name": "tokenMintB",
            "type": "pubkey"
          },
          {
            "name": "tokenVaultA",
            "type": "pubkey"
          },
          {
            "name": "tokenVaultB",
            "type": "pubkey"
          },
          {
            "name": "feeTier",
            "type": "pubkey"
          },
          {
            "name": "tickCurrentIndex",
            "type": "i32"
          },
          {
            "name": "sqrtPrice",
            "type": "u128"
          },
          {
            "name": "feeGrowthGlobalA",
            "type": "u128"
          },
          {
            "name": "feeGrowthGlobalB",
            "type": "u128"
          },
          {
            "name": "protocolFeeOwedA",
            "type": "u64"
          },
          {
            "name": "protocolFeeOwedB",
            "type": "u64"
          },
          {
            "name": "liquidity",
            "type": "u128"
          },
          {
            "name": "feeRate",
            "type": "u16"
          },
          {
            "name": "protocolFeeRate",
            "type": "u16"
          },
          {
            "name": "tickSpacing",
            "type": "u16"
          },
          {
            "name": "rewardInfos",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "rewardInfo"
                  }
                },
                3
              ]
            }
          }
        ]
      }
    },
    {
      "name": "poolConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "feeAuthority",
            "type": "pubkey"
          },
          {
            "name": "collectProtocolFeesAuthority",
            "type": "pubkey"
          },
          {
            "name": "rewardEmissionsSuperAuthority",
            "type": "pubkey"
          },
          {
            "name": "defaultProtocolFeeRate",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "poolCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "pubkey"
          },
          {
            "name": "tokenMintA",
            "type": "pubkey"
          },
          {
            "name": "tokenMintB",
            "type": "pubkey"
          },
          {
            "name": "tickSpacing",
            "type": "u16"
          },
          {
            "name": "initialSqrtPrice",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "positionClosedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "positionId",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "positionCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "positionId",
            "type": "pubkey"
          },
          {
            "name": "poolId",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "tickLowerIndex",
            "type": "i32"
          },
          {
            "name": "tickUpperIndex",
            "type": "i32"
          }
        ]
      }
    },
    {
      "name": "positionLockEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "positionId",
            "type": "pubkey"
          },
          {
            "name": "lockType",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "positionRangeResetEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "positionId",
            "type": "pubkey"
          },
          {
            "name": "tickLowerIndexBefore",
            "type": "i32"
          },
          {
            "name": "tickUpperIndexBefore",
            "type": "i32"
          },
          {
            "name": "tickLowerIndexAfter",
            "type": "i32"
          },
          {
            "name": "tickUpperIndexAfter",
            "type": "i32"
          }
        ]
      }
    },
    {
      "name": "protocolFeeRateChangedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "pubkey"
          },
          {
            "name": "protocolFeeRate",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "protocolFeesCollectedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "pubkey"
          },
          {
            "name": "protocolFeeAmountA",
            "type": "u64"
          },
          {
            "name": "protocolFeeAmountB",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "rewardCollectedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "positionId",
            "type": "pubkey"
          },
          {
            "name": "rewardIndex",
            "type": "u8"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "rewardEmissionsChangedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "pubkey"
          },
          {
            "name": "rewardIndex",
            "type": "u8"
          },
          {
            "name": "emissionsPerSecondX64",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "rewardInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "emissionsPerSecondX64",
            "type": "u128"
          },
          {
            "name": "growthGlobalX64",
            "type": "u128"
          },
          {
            "name": "lastUpdatedTimestamp",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "rewardInitializedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "pubkey"
          },
          {
            "name": "rewardIndex",
            "type": "u8"
          },
          {
            "name": "rewardMint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "swapEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "amountOut",
            "type": "u64"
          },
          {
            "name": "feeAmount",
            "type": "u64"
          },
          {
            "name": "aToB",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "tick",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "liquidityNet",
            "type": "i128"
          },
          {
            "name": "liquidityGross",
            "type": "u128"
          },
          {
            "name": "feeGrowthOutsideA",
            "type": "u128"
          },
          {
            "name": "feeGrowthOutsideB",
            "type": "u128"
          },
          {
            "name": "rewardGrowthsOutside",
            "type": {
              "array": [
                "u128",
                3
              ]
            }
          }
        ]
      }
    },
    {
      "name": "tickArray",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "startTickIndex",
            "type": "i32"
          },
          {
            "name": "ticks",
            "type": {
              "vec": {
                "defined": {
                  "name": "tick"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "tickArrayCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "pubkey"
          },
          {
            "name": "startTickIndex",
            "type": "i32"
          }
        ]
      }
    },
    {
      "name": "whirlpoolBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolBump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
