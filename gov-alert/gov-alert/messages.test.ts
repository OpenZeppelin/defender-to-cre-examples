import { describe, expect, test } from 'bun:test'
import { formatGovernanceAlert } from './messages'

const explorerBaseUrl = 'https://sepolia.etherscan.io/tx'
const transactionHash = `0x${'ab'.repeat(32)}`
const transactionLink = `[TX](<${explorerBaseUrl}/${transactionHash}>)`

describe('formatGovernanceAlert', () => {
	test('formats ProposalCreated exactly like the Defender template', () => {
		const message = formatGovernanceAlert(
			{
				type: 'ProposalCreated',
				proposalId: 1234567890n,
				proposer: '0x1234567890abcdef1234567890abcdef12345678',
				description: '## Upgrade the treasury\nImplementation details',
			},
			transactionHash,
			explorerBaseUrl,
		)

		expect(message).toBe(
			`**New Proposal** Upgrade the treasury by 0x1234 ${transactionLink}`,
		)
	})

	test('falls back to the shortened proposal id when the description is unavailable', () => {
		const message = formatGovernanceAlert(
			{
				type: 'ProposalCreated',
				proposalId: 1234567890n,
				proposer: '0x1234567890abcdef1234567890abcdef12345678',
				description: undefined,
			},
			transactionHash,
			explorerBaseUrl,
		)

		expect(message).toBe(
			`**New Proposal** Proposal 1234..7890 by 0x1234 ${transactionLink}`,
		)
	})

	test.each([
		[0, '**Vote**', '⛔'],
		[1, '**Vote**', '✅'],
		[2, '**Abstain**', '🙊'],
	] as const)('formats VoteCast support %i with its Defender wording', (support, label, emoji) => {
		const message = formatGovernanceAlert(
			{
				type: 'VoteCast',
				proposalId: 1234567890n,
				voter: '0xabcdef1234567890abcdef1234567890abcdef12',
				weight: 123456789012345n,
				support,
				reason: 'because it is safe',
			},
			transactionHash,
			explorerBaseUrl,
		)

		expect(message).toBe(
			`${label} Proposal 1234..7890 ${emoji} 123,456,789,012,345 by 0xabcd ${transactionLink}\n\`\`\`because it is safe\`\`\``,
		)
	})

	test('omits the VoteCast reason block when the reason is empty', () => {
		const message = formatGovernanceAlert(
			{
				type: 'VoteCast',
				proposalId: 1234567890n,
				voter: '0xabcdef1234567890abcdef1234567890abcdef12',
				weight: 1000n,
				support: 1,
				reason: '',
			},
			transactionHash,
			explorerBaseUrl,
		)

		expect(message).toBe(
			`**Vote** Proposal 1234..7890 ✅ 1,000 by 0xabcd ${transactionLink}`,
		)
	})

	test('rejects a VoteCast support value outside the Governor range', () => {
		expect(() =>
			formatGovernanceAlert(
				{
					type: 'VoteCast',
					proposalId: 1n,
					voter: '0xabcdef1234567890abcdef1234567890abcdef12',
					weight: 1n,
					support: 3 as 0,
					reason: '',
				},
				transactionHash,
				explorerBaseUrl,
			),
		).toThrow('Unsupported vote type: 3')
	})

	test.each([
		[
			{ type: 'ProposalCanceled', proposalId: 1234567890n } as const,
			`**Canceled Proposal** Proposal 1234..7890 ⛔ ${transactionLink}`,
		],
		[
			{ type: 'ProposalExecuted', proposalId: 1234567890n } as const,
			`**Executed Proposal** Proposal 1234..7890 ✅ ${transactionLink}`,
		],
		[
			{ type: 'ProposalQueued', proposalId: 1234567890n, eta: 1777777777n } as const,
			`**Queued Proposal** Proposal 1234..7890 ✅ available to execute at timestamp 1777777777 ${transactionLink}`,
		],
	])('includes the transaction link for $type', (event, expected) => {
		expect(formatGovernanceAlert(event, transactionHash, explorerBaseUrl)).toBe(expected)
	})
})
