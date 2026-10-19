# Keeper Bot — CRE Starter Template (TypeScript)

Adapted from Chainlink's [`keeper-bot` starter template](https://github.com/smartcontractkit/cre-templates), MIT-licensed; see [`LICENSE`](LICENSE).

Cron-based smart contract maintenance — read state, check condition, execute if needed.

**⚠️ DISCLAIMER**

This template is an educational example to demonstrate how to interact with Chainlink systems, products, and services. It is provided **"AS IS"** and **"AS AVAILABLE"** without warranties of any kind, has **not** been audited, and may omit checks or error handling for clarity. **Do not use this code in production** without performing your own audits and applying best practices. Neither Chainlink Labs, the Chainlink Foundation, nor Chainlink node operators are responsible for unintended outputs generated due to errors in code.

---

## Overview

This template demonstrates the universal **cron -> read -> check -> write** pattern using the Chainlink CRE (Compute Runtime Environment). A cron trigger fires on a configurable schedule, reads on-chain state to check if upkeep is needed, and conditionally writes back to the contract.

### Use Cases

- **Upkeep tasks**: Any periodic "check and execute" pattern
- **Rebasing tokens**: Call `rebase()` on elastic supply tokens on schedule
- **Oracle updates**: Push price updates at fixed intervals
- **Liquidation checks**: Monitor collateral ratios and trigger liquidations
- **Counter/heartbeat**: Simple liveness proof for monitoring

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CRE DON                                │
│                                                             │
│  ┌──────────┐    ┌───────────────┐    ┌──────────────────┐  │
│  │   CRON   │───>│  Read State   │───>│  Check Condition │  │
│  │ Trigger  │    │  (EVMClient)  │    │  (if threshold)  │  │
│  │ (5 min)  │    │               │    │                  │  │
│  └──────────┘    └───────────────┘    └────────┬─────────┘  │
│                                                │            │
│                                     ┌──────────v──────────┐ │
│                                     │  Condition met?     │ │
│                                     │  YES -> Write report│ │
│                                     │  NO  -> Log & skip  │ │
│                                     └──────────┬──────────┘ │
│                                                │            │
└────────────────────────────────────────────────┼────────────┘
                                                 │
                                      ┌──────────v──────────┐
                                      │  KeystoneForwarder  │
                                      │  -> Consumer.onReport│
                                      └─────────────────────┘
```

## Components

### CRE Workflow (`keeper/`)

The TypeScript workflow runs off-chain inside CRE DON:

1. **Cron trigger** fires every 5 minutes (configurable)
2. **Reads** `needsUpkeep()` from the on-chain `KeeperConsumer` contract
3. **If upkeep is needed**: encodes the new counter value, generates a DON-signed report, and writes it on-chain via the KeystoneForwarder
4. **If not needed**: logs and skips

### Consumer Contract (`contracts/evm/src/KeeperConsumer.sol`)

A simple Solidity contract extending `ReceiverTemplate`:

- `needsUpkeep()` — view function that checks if `interval` seconds have elapsed
- `_processReport(bytes)` — called by CRE Forwarder via ReceiverTemplate, decodes and stores the new counter
- `counter`, `lastExecuted`, `interval` — public state variables

## Getting Started

You need your own `KeeperConsumer` on Sepolia before the workflow can run: `config.example.json` ships with a placeholder address.

### Prerequisites

- [Bun](https://bun.sh/) 1.4 or later
- [CRE CLI](https://docs.chain.link/cre) installed

### 1. Install Dependencies

```bash
(cd contracts && bun install --frozen-lockfile)
(cd keeper && bun install --frozen-lockfile)
```

### 2. Run Tests

```bash
(cd keeper && bun test)
```

### 3. Deploy the Consumer Contract

Deploy `contracts/evm/src/KeeperConsumer.sol` to Sepolia using [Remix](https://remix.ethereum.org/) or Foundry. Constructor arguments:

- `forwarder`: the Forwarder your contract trusts. For `cre workflow simulate --broadcast` (step 4), use the Sepolia MockForwarder (`0x15fc6ae953e024d975e77382eeec56a9101f9f88`). For a deployed workflow, use the production KeystoneForwarder on Sepolia (`0xF8344CFd5c43616a4366C34E3EEE75af79a74482`); check the [Forwarder Directory](https://docs.chain.link/cre/guides/workflow/using-evm-client/forwarder-directory-ts) for other networks. Deploy a separate contract for each, and never point a deployed Receiver at the MockForwarder.
- `_interval`: Seconds between allowed executions (e.g., `300` for 5 minutes)

Then create your local config and set `contractAddress` to the deployed address:

```bash
cp keeper/config.example.json keeper/config.staging.json
```

### 4. Simulate

```bash
# Dry run (no broadcast)
cre workflow simulate ./keeper --target staging-settings

# With actual on-chain transaction
cre workflow simulate ./keeper --target staging-settings --broadcast
```

## Customization

- **Change the schedule**: Edit `schedule` in `config.staging.json` (cron syntax)
- **Change the condition**: Replace `needsUpkeep()` with any view function that returns whether to execute
- **Change the action**: Modify the `_processReport()` logic in `KeeperConsumer.sol` to perform any state mutation

## Security

- The `KeeperConsumer.sol` contract is a **demo** — audit and customize before production use
- The `ReceiverTemplate` base contract validates that only CRE Forwarder can call `onReport()`
- Never commit `.env` files or secrets

## License

MIT, Copyright (c) 2025 SmartContract. See [`LICENSE`](LICENSE). The `@chainlink/cre-sdk` dependency is licensed separately under BUSL-1.1.
