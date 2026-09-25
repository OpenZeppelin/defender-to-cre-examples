export type GovernanceAlertEvent =
	| {
			type: 'ProposalCreated'
			proposalId: bigint
			proposer: string
			description?: string
	  }
	| {
			type: 'VoteCast'
			proposalId: bigint
			voter: string
			weight: bigint
			support: 0 | 1 | 2
			reason: string
	  }
	| { type: 'ProposalCanceled'; proposalId: bigint }
	| { type: 'ProposalExecuted'; proposalId: bigint }
	| { type: 'ProposalQueued'; proposalId: bigint; eta: bigint }

const noEntryEmoji = '⛔'
const checkMarkEmoji = '✅'
const speakNoEvilEmoji = '🙊'

function getProposalTitle(proposalId: bigint): string {
	const id = proposalId.toString()
	return `Proposal ${id.slice(0, 4)}..${id.slice(-4)}`
}

function getProposalTitleFromDescription(description: string | undefined): string | undefined {
	if (description === undefined) return undefined
	const firstLine = description.split('\n')[0]
	return firstLine === undefined ? undefined : firstLine.replaceAll('#', '').trim()
}

function formatUnsignedInteger(value: bigint): string {
	if (value < 0n) throw new Error(`Expected an unsigned integer, received: ${value}`)

	const digits = value.toString()
	let formatted = ''
	for (let index = 0; index < digits.length; index += 1) {
		if (index > 0 && (digits.length - index) % 3 === 0) formatted += ','
		formatted += digits[index]
	}
	return formatted
}

function transactionLink(transactionHash: string, explorerBaseUrl: string): string {
	return `[TX](<${explorerBaseUrl}/${transactionHash}>)`
}

export function formatGovernanceAlert(
	event: GovernanceAlertEvent,
	transactionHash: string,
	explorerBaseUrl: string,
): string {
	const link = transactionLink(transactionHash, explorerBaseUrl)

	switch (event.type) {
		case 'ProposalCreated': {
			const proposalName =
				getProposalTitleFromDescription(event.description) ?? getProposalTitle(event.proposalId)
			return `**New Proposal** ${proposalName} by ${event.proposer.slice(0, 6)} ${link}`
		}
		case 'VoteCast': {
			let voteType: string
			let supportEmoji: string
			switch (event.support) {
				case 0:
					voteType = '**Vote**'
					supportEmoji = noEntryEmoji
					break
				case 1:
					voteType = '**Vote**'
					supportEmoji = checkMarkEmoji
					break
				case 2:
					voteType = '**Abstain**'
					supportEmoji = speakNoEvilEmoji
					break
				default:
					throw new Error(`Unsupported vote type: ${event.support}`)
			}

			let message = `${voteType} ${getProposalTitle(event.proposalId)} ${supportEmoji} ${formatUnsignedInteger(event.weight)} by ${event.voter.slice(0, 6)} ${link}`
			if (event.reason !== '') message += `\n\`\`\`${event.reason}\`\`\``
			return message
		}
		case 'ProposalCanceled':
			return `**Canceled Proposal** ${getProposalTitle(event.proposalId)} ${noEntryEmoji} ${link}`
		case 'ProposalExecuted':
			return `**Executed Proposal** ${getProposalTitle(event.proposalId)} ${checkMarkEmoji} ${link}`
		case 'ProposalQueued':
			return `**Queued Proposal** ${getProposalTitle(event.proposalId)} ${checkMarkEmoji} available to execute at timestamp ${event.eta} ${link}`
	}
}
