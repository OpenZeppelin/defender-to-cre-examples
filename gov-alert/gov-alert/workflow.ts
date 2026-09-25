import {
	bytesToBase64,
	bytesToHex,
	consensusIdenticalAggregation,
	cre,
	getNetwork,
	ok,
	type HTTPSendRequester,
	type Runtime,
} from '@chainlink/cre-sdk'
import type { Address } from 'viem'
import { z } from 'zod'
import {
	GovernorEvents,
	type DecodedLog,
	type ProposalCanceledDecoded,
	type ProposalCreatedDecoded,
	type ProposalExecutedDecoded,
	type ProposalQueuedDecoded,
	type VoteCastDecoded,
} from '../contracts/evm/ts/generated/GovernorEvents'
import { formatGovernanceAlert, type GovernanceAlertEvent } from './messages'

export const configSchema = z.object({
	chainSelectorName: z.string(),
	governorAddress: z.string(),
	blockExplorerBaseUrl: z.string(),
	notifyWebhookUrl: z.string(),
})
export type Config = z.infer<typeof configSchema>

export type Notification = {
	message: string
	transactionHash: string
	logIndex: number
}

type PostInput = {
	url: string
	message: string
	idempotencyKey: string
}

type PostResponse = { statusCode: number }

function postNotification(sender: HTTPSendRequester, input: PostInput): PostResponse {
	const bodyBytes = new TextEncoder().encode(JSON.stringify({ text: input.message }))
	const response = sender
		.sendRequest({
			method: 'POST',
			url: input.url,
			body: bytesToBase64(bodyBytes),
			headers: {
				'Content-Type': 'application/json',
				'Idempotency-Key': input.idempotencyKey,
			},
			// SDK 1.19.1 expresses cache read/write as store + a non-zero maxAge.
			cacheSettings: { store: true, maxAge: '60s' },
		})
		.result()

	if (!ok(response)) {
		throw new Error(`HTTP request failed with status: ${response.statusCode}`)
	}
	return { statusCode: response.statusCode }
}

export function sendNotification(runtime: Runtime<Config>, notification: Notification): string {
	runtime.log(notification.message)
	const idempotencyKey = `${runtime.config.chainSelectorName}:${notification.transactionHash}:${notification.logIndex}`
	const http = new cre.capabilities.HTTPClient()
	const response = http
		.sendRequest(runtime, postNotification, consensusIdenticalAggregation<PostResponse>())({
			url: runtime.config.notifyWebhookUrl,
			message: notification.message,
			idempotencyKey,
		})
		.result()

	return `notified (${response.statusCode}): ${notification.message}`
}

function handleEvent(
	runtime: Runtime<Config>,
	payload: { txHash: Uint8Array; index: number },
	event: GovernanceAlertEvent,
): string {
	const transactionHash = bytesToHex(payload.txHash)
	const message = formatGovernanceAlert(
		event,
		transactionHash,
		runtime.config.blockExplorerBaseUrl,
	)
	return sendNotification(runtime, { message, transactionHash, logIndex: payload.index })
}

export const onProposalCreated = (
	runtime: Runtime<Config>,
	payload: DecodedLog<ProposalCreatedDecoded>,
): string =>
	handleEvent(runtime, payload, {
		type: 'ProposalCreated',
		proposalId: payload.data.proposalId,
		proposer: payload.data.proposer,
		description: payload.data.description,
	})

export const onVoteCast = (
	runtime: Runtime<Config>,
	payload: DecodedLog<VoteCastDecoded>,
): string =>
	handleEvent(runtime, payload, {
		type: 'VoteCast',
		proposalId: payload.data.proposalId,
		voter: payload.data.voter,
		weight: payload.data.weight,
		support: payload.data.support as 0 | 1 | 2,
		reason: payload.data.reason,
	})

export const onProposalCanceled = (
	runtime: Runtime<Config>,
	payload: DecodedLog<ProposalCanceledDecoded>,
): string =>
	handleEvent(runtime, payload, {
		type: 'ProposalCanceled',
		proposalId: payload.data.proposalId,
	})

export const onProposalExecuted = (
	runtime: Runtime<Config>,
	payload: DecodedLog<ProposalExecutedDecoded>,
): string =>
	handleEvent(runtime, payload, {
		type: 'ProposalExecuted',
		proposalId: payload.data.proposalId,
	})

export const onProposalQueued = (
	runtime: Runtime<Config>,
	payload: DecodedLog<ProposalQueuedDecoded>,
): string =>
	handleEvent(runtime, payload, {
		type: 'ProposalQueued',
		proposalId: payload.data.proposalId,
		eta: payload.data.eta,
	})

export function initWorkflow(config: Config) {
	const network = getNetwork({
		chainFamily: 'evm',
		chainSelectorName: config.chainSelectorName,
		isTestnet: true,
	})
	if (!network) throw new Error(`Network not found: ${config.chainSelectorName}`)

	const evmClient = new cre.capabilities.EVMClient(network.chainSelector.selector)
	const governor = new GovernorEvents(evmClient, config.governorAddress as Address)

	return [
		cre.handler(governor.logTriggerProposalCreated(), onProposalCreated),
		cre.handler(governor.logTriggerVoteCast(), onVoteCast),
		cre.handler(governor.logTriggerProposalCanceled(), onProposalCanceled),
		cre.handler(governor.logTriggerProposalExecuted(), onProposalExecuted),
		cre.handler(governor.logTriggerProposalQueued(), onProposalQueued),
	]
}
