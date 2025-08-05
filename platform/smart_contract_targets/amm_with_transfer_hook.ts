/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/amm_with_transfer_hook.json`.
 */
export type AmmWithTransferHook = {
  "address": "F4RupoT7DMW6dDbkzoyG3R3LndyW9EJEeBp4FvMu9v56",
  "metadata": {
    "name": "ammWithTransferHook",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addToWhitelist",
      "discriminator": [
        157,
        211,
        52,
        54,
        144,
        81,
        5,
        55
      ],
      "accounts": [
        {
          "name": "tokenInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "token_info.token_mint",
                "account": "tokenInfo"
              }
            ]
          }
        },
        {
          "name": "tokenCreator",
          "signer": true,
          "relations": [
            "tokenInfo"
          ]
        }
      ],
      "args": [
        {
          "name": "newAddress",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeTokenInfo",
      "discriminator": [
        214,
        255,
        202,
        75,
        11,
        184,
        55,
        139
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "extraAccountMetaList",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  120,
                  116,
                  114,
                  97,
                  45,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                  45,
                  109,
                  101,
                  116,
                  97,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tokenInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "tokenSymbol",
          "type": "string"
        },
        {
          "name": "tokenTotalSupply",
          "type": "u64"
        },
        {
          "name": "isWhaleEnabled",
          "type": "bool"
        },
        {
          "name": "isWhitelistEnabled",
          "type": "bool"
        },
        {
          "name": "isTotalTransferAmountEnabled",
          "type": "bool"
        },
        {
          "name": "whaleAmount",
          "type": "u64"
        },
        {
          "name": "totalTransferAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setMaxTransferLimit",
      "discriminator": [
        241,
        64,
        166,
        45,
        114,
        132,
        14,
        74
      ],
      "accounts": [
        {
          "name": "tokenInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "token_info.token_mint",
                "account": "tokenInfo"
              }
            ]
          }
        },
        {
          "name": "tokenCreator",
          "signer": true,
          "relations": [
            "tokenInfo"
          ]
        }
      ],
      "args": [
        {
          "name": "limit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferHook",
      "discriminator": [
        220,
        57,
        220,
        152,
        126,
        125,
        97,
        168
      ],
      "accounts": [
        {
          "name": "sourceToken"
        },
        {
          "name": "mint"
        },
        {
          "name": "destinationToken"
        },
        {
          "name": "owner"
        },
        {
          "name": "tokenInfo",
          "docs": [
            "Token info holds whitelist, whale settings, and transfer limits"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "extraAccountMetaList",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  120,
                  116,
                  114,
                  97,
                  45,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                  45,
                  109,
                  101,
                  116,
                  97,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateWhaleAlert",
      "discriminator": [
        136,
        211,
        248,
        40,
        251,
        255,
        155,
        231
      ],
      "accounts": [
        {
          "name": "tokenInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "token_info.token_mint",
                "account": "tokenInfo"
              }
            ]
          }
        },
        {
          "name": "tokenCreator",
          "signer": true,
          "relations": [
            "tokenInfo"
          ]
        }
      ],
      "args": [
        {
          "name": "enable",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tokenInfo",
      "discriminator": [
        109,
        162,
        52,
        125,
        77,
        166,
        37,
        202
      ]
    }
  ],
  "events": [
    {
      "name": "whaleTransferEvent",
      "discriminator": [
        159,
        157,
        228,
        124,
        143,
        75,
        115,
        4
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notWhitelisted",
      "msg": "TransferHook: Owner not whitelisted"
    },
    {
      "code": 6001,
      "name": "transferLimitExceeded",
      "msg": "TransferHook: Transfer amount exceeds allowed maximum"
    },
    {
      "code": 6002,
      "name": "notInTransferHook",
      "msg": "TransferHook: Not called during transfer hook"
    },
    {
      "code": 6003,
      "name": "whitelistDisabled",
      "msg": "TransferHook: Whitelist is disabled"
    }
  ],
  "types": [
    {
      "name": "tokenInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenAddress",
            "type": "pubkey"
          },
          {
            "name": "tokenName",
            "type": "string"
          },
          {
            "name": "tokenSymbol",
            "type": "string"
          },
          {
            "name": "tokenDecimals",
            "type": "u8"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "tokenCreator",
            "type": "pubkey"
          },
          {
            "name": "isWhaleEnabled",
            "type": "bool"
          },
          {
            "name": "isWhitelistEnabled",
            "type": "bool"
          },
          {
            "name": "isTotalTransferAmountEnabled",
            "type": "bool"
          },
          {
            "name": "whaleAmount",
            "type": "u64"
          },
          {
            "name": "totalTransferAmount",
            "type": "u64"
          },
          {
            "name": "whitelistAddresses",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "whaleTransferEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "whaleAddress",
            "type": "pubkey"
          },
          {
            "name": "transferAmount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
