# Test Governor (Sepolia)

A valueless ERC20Votes token and a Governor with a one-block voting delay, a twelve-block voting period, zero proposal threshold and zero quorum. The proposed call is `Governor.name()`, so execution would not change state.

Dependencies, pinned:

```sh
git clone --depth 1 --branch v5.7.0 https://github.com/OpenZeppelin/openzeppelin-contracts.git lib/openzeppelin-contracts
git clone --depth 1 --branch v1.16.2 https://github.com/foundry-rs/forge-std.git lib/forge-std
forge test
```

Deploy (set `SEPOLIA_RPC_URL` and `MIGRATION_DEPLOYER_ADDRESS`; preview first, then add `--broadcast`):

```sh
forge script script/DeployMigrationGovernor.s.sol:DeployMigrationGovernor --rpc-url sepolia --account <keystore-account> -vvvv
```

Create a proposal and vote (`MIGRATION_GOVERNOR_ADDRESS`, `MIGRATION_PROPOSAL_DESCRIPTION`, and for voting `MIGRATION_PROPOSAL_ID`):

```sh
forge script script/EmitGovernanceEvents.s.sol:EmitGovernanceEvents --sig 'createProposal()' --rpc-url sepolia --account <keystore-account> --broadcast
forge script script/EmitGovernanceEvents.s.sol:EmitGovernanceEvents --sig 'castVote()' --rpc-url sepolia --account <keystore-account> --broadcast
```

The same proposal with `cast`:

```sh
cast send <GOVERNOR> 'propose(address[],uint256[],bytes[],string)' "[<GOVERNOR>]" "[0]" "[0x06fdde03]" "<unique description>" --account <keystore-account> --rpc-url <sepolia-rpc>
```
