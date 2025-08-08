# Pool Program

This is a Solana program implementing an Automated Market Maker (AMM) with concentrated liquidity, similar to Uniswap v3. The program is built using the Anchor framework.

## Features

- Concentrated liquidity positions
- Multiple fee tiers
- Protocol fees
- Reward emissions
- Position bundling
- Position locking

## Structure

The program is organized into several modules:

- `constants`: Program constants like seeds, limits, etc.
- `errors`: Custom error types
- `events`: Event definitions for logging
- `instructions`: Implementation of program instructions
- `manager`: Manager functions for complex operations
- `math`: Mathematical functions for AMM operations
- `state`: Program state definitions
- `util`: Utility functions

## Key Instructions

- `initialize_config`: Set up the program configuration
- `initialize_pool`: Create a new liquidity pool
- `initialize_tick_array`: Initialize a tick array for a pool
- `initialize_fee_tier`: Create a new fee tier
- `open_position`: Create a new position in a pool
- `increase_liquidity`: Add liquidity to a position
- `decrease_liquidity`: Remove liquidity from a position
- `swap`: Execute a token swap in a pool
- `collect_fees`: Collect fees earned by a position

## Development

This program is under active development. More features and optimizations will be added in future updates.

## License

[MIT](LICENSE) 