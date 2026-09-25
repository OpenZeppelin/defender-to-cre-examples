import { describe, expect } from 'bun:test'
import { HttpActionsMock, newTestRuntime, test } from '@chainlink/cre-sdk/test'
import type { Address } from 'viem'
import {
	initWorkflow,
	onProposalCanceled,
	onProposalCreated,
	onProposalExecuted,
	onProposalQueued,
	onVoteCast,
	sendNotification,
} from './workflow'

const governorAddress = '0x1111111111111111111111111111111111111111' as Address
const voter = '0xabcdef1234567890abcdef1234567890abcdef12' as Address
const proposer = '0x1234567890abcdef1234567890abcdef12345678' as Address
const transactionHashBytes = Uint8Array.from({ length: 32 }, () => 0xab)
const transactionHash = `0x${'ab'.repeat(32)}`

const config = {
	chainSelectorName: 'ethereum-testnet-sepolia',
	governorAddress,
	blockExplorerBaseUrl: 'https://sepolia.etherscan.io/tx',
	notifyWebhookUrl: 'https://collector.invalid/private-test-id',
}

function payload<T>(data: T, index = 7) {
	return {
		address: new Uint8Array(20),
		topics: [],
		txHash: transactionHashBytes,
		blockHash: new Uint8Array(32),
		eventSig: new Uint8Array(32),
		blockNumber: undefined,
		txIndex: 0,
		index,
		removed: false,
		data,
	}
}

function installSuccessfulHttpMock(capture?: (request: any) => void) {
	const httpMock = HttpActionsMock.testInstance()
	httpMock.sendRequest = request => {
		capture?.(request)
		return { statusCode: 204, headers: {}, multiHeaders: {}, body: '' }
	}
}

describe('event handlers', () => {
	test('formats and sends ProposalCreated with its transaction metadata', () => {
		installSuccessfulHttpMock()
		const runtime = newTestRuntime(null, {}, config)
		const result = onProposalCreated(
			runtime,
			payload({
				proposalId: 1234567890n,
				proposer,
				targets: [],
				values: [],
				signatures: [],
				calldatas: [],
				startBlock: 1n,
				endBlock: 2n,
				description: '# Test proposal',
			}),
		)

		expect(result).toBe(
			`notified (204): **New Proposal** Test proposal by 0x1234 [TX](<${config.blockExplorerBaseUrl}/${transactionHash}>)`,
		)
	})

	test('formats and sends VoteCast without Intl', () => {
		installSuccessfulHttpMock()
		const runtime = newTestRuntime(null, {}, config)
		const result = onVoteCast(
			runtime,
			payload({
				voter,
				proposalId: 1234567890n,
				support: 1,
				weight: 1234567n,
				reason: 'tested',
			}),
		)

		expect(result).toContain(
			`**Vote** Proposal 1234..7890 ✅ 1,234,567 by 0xabcd [TX](<${config.blockExplorerBaseUrl}/${transactionHash}>)\n\`\`\`tested\`\`\``,
		)
	})

	test('all remaining handlers include their transaction link', () => {
		installSuccessfulHttpMock()
		const runtime = newTestRuntime(null, {}, config)

		for (const result of [
			onProposalCanceled(runtime, payload({ proposalId: 1234567890n })),
			onProposalExecuted(runtime, payload({ proposalId: 1234567890n })),
			onProposalQueued(runtime, payload({ proposalId: 1234567890n, eta: 1777777777n })),
		]) {
			expect(result).toContain(`[TX](<${config.blockExplorerBaseUrl}/${transactionHash}>)`)
		}
	})
})

describe('sendNotification', () => {
	test('sends deterministic JSON and cache metadata through the HTTP capability', () => {
		let capturedRequest: any
		installSuccessfulHttpMock(request => {
			capturedRequest = request
		})
		const runtime = newTestRuntime(null, {}, config)

		const result = sendNotification(runtime, {
			message: 'test message',
			transactionHash,
			logIndex: 7,
		})

		expect(result).toBe('notified (204): test message')
		expect(capturedRequest.method).toBe('POST')
		expect(capturedRequest.url).toBe(config.notifyWebhookUrl)
		expect(capturedRequest.headers['Content-Type']).toBe('application/json')
		expect(capturedRequest.headers['Idempotency-Key']).toBe(
			`${config.chainSelectorName}:${transactionHash}:7`,
		)
		expect(new TextDecoder().decode(capturedRequest.body)).toBe(
			JSON.stringify({ text: 'test message' }),
		)
		expect(capturedRequest.cacheSettings.store).toBe(true)
		expect(capturedRequest.cacheSettings.maxAge.seconds).toBe(60n)
	})

	test('fails visibly when the receiver returns a non-2xx status', () => {
		const httpMock = HttpActionsMock.testInstance()
		httpMock.sendRequest = () => ({
			statusCode: 500,
			headers: {},
			multiHeaders: {},
			body: '',
		})
		const runtime = newTestRuntime(null, {}, config)

		expect(() =>
			sendNotification(runtime, {
				message: 'test message',
				transactionHash,
				logIndex: 7,
			}),
		).toThrow('HTTP request failed with status: 500')
	})
})

describe('initWorkflow', () => {
	test('registers one event-only handler for each Defender governance event', () => {
		const handlers = initWorkflow(config)

		expect(handlers).toHaveLength(5)
		expect(handlers.map(handler => handler.fn)).toEqual([
			onProposalCreated,
			onVoteCast,
			onProposalCanceled,
			onProposalExecuted,
			onProposalQueued,
		])
		for (const handler of handlers) {
			const trigger = handler.trigger as { adapt?: unknown; configAsAny?: unknown }
			expect(typeof trigger.adapt).toBe('function')
			expect(typeof trigger.configAsAny).toBe('function')
		}
	})
})
