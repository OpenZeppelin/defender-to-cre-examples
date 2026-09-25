# Defender to CRE examples

Two Defender workflows ported to [Chainlink CRE](https://docs.chain.link/cre), used by the migration guide "Adapting Defender Workflows to Chainlink CRE".

| Folder | Defender origin | CRE pattern |
|---|---|---|
| `gov-alert/` | `governance_alert` template (Monitor + Action) | EVM Log trigger on five Governor events, HTTP notification |
| `keeper/` | Scheduled Action that sends a transaction when work is due | Cron trigger, contract read, report written through a Receiver |

`keeper/` is Chainlink's `keeper-bot` starter template.

Tested with CRE CLI 1.34.0, `@chainlink/cre-sdk` 1.19.1, Bun 1.4.0, on Sepolia.

## gov-alert

```bash
cd gov-alert
(cd contracts && bun install --frozen-lockfile)
(cd gov-alert && bun install --frozen-lockfile && bun test && bun run typecheck)
cp gov-alert/config.example.json gov-alert/config.staging.json   # fill in your values
cre workflow build ./gov-alert
```

Replay a past `ProposalCreated` receipt:

```bash
cre workflow simulate ./gov-alert --non-interactive \
  --trigger-index 0 --evm-tx-hash <tx-hash> --evm-event-index <log-position> \
  --target staging-settings
```

`fixture/` holds the test Governor used for the Sepolia runs (Foundry):

See [`gov-alert/fixture/README.md`](gov-alert/fixture/README.md).

## keeper

```bash
cd keeper
(cd contracts && bun install --frozen-lockfile)
(cd keeper && bun install --frozen-lockfile && bun test && bun run typecheck)
cp keeper/config.example.json keeper/config.staging.json   # fill in your values
cre workflow build ./keeper
```

Local configuration (`config.staging.json`, `config.production.json`) is git-ignored. Do not commit endpoints or keys.
