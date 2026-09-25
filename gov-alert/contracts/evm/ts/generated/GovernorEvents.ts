// Code generated — DO NOT EDIT.
import {
  decodeEventLog,
  decodeFunctionResult,
  encodeEventTopics,
  encodeFunctionData,
  zeroAddress,
} from 'viem'
import type { Address, Hex } from 'viem'
import {
  bytesToHex,
  encodeCallMsg,
  EVMClient,
  hexToBase64,
  LAST_FINALIZED_BLOCK_NUMBER,
  prepareReportRequest,
  type EVMLog,
  type Runtime,
} from '@chainlink/cre-sdk'

export interface DecodedLog<T> extends Omit<EVMLog, 'data'> { data: T }

const encodeTopicValue = (t: Hex | Hex[] | null): string[] => {
  if (t == null) return []
  if (Array.isArray(t)) return t.map(hexToBase64)
  return [hexToBase64(t)]
}





/**
 * Filter params for ProposalCanceled. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type ProposalCanceledTopics = {
}

/**
 * Decoded ProposalCanceled event data.
 */
export type ProposalCanceledDecoded = {
  proposalId: bigint
}


/**
 * Filter params for ProposalCreated. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type ProposalCreatedTopics = {
}

/**
 * Decoded ProposalCreated event data.
 */
export type ProposalCreatedDecoded = {
  proposalId: bigint
  proposer: `0x${string}`
  targets: readonly `0x${string}`[]
  values: readonly bigint[]
  signatures: readonly string[]
  calldatas: readonly `0x${string}`[]
  startBlock: bigint
  endBlock: bigint
  description: string
}


/**
 * Filter params for ProposalExecuted. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type ProposalExecutedTopics = {
}

/**
 * Decoded ProposalExecuted event data.
 */
export type ProposalExecutedDecoded = {
  proposalId: bigint
}


/**
 * Filter params for ProposalQueued. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type ProposalQueuedTopics = {
}

/**
 * Decoded ProposalQueued event data.
 */
export type ProposalQueuedDecoded = {
  proposalId: bigint
  eta: bigint
}


/**
 * Filter params for VoteCast. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type VoteCastTopics = {
  voter?: `0x${string}`
}

/**
 * Decoded VoteCast event data.
 */
export type VoteCastDecoded = {
  voter: `0x${string}`
  proposalId: bigint
  support: number
  weight: bigint
  reason: string
}


export const GovernorEventsABI = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"proposalId","type":"uint256"}],"name":"ProposalCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"proposalId","type":"uint256"},{"indexed":false,"internalType":"address","name":"proposer","type":"address"},{"indexed":false,"internalType":"address[]","name":"targets","type":"address[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"},{"indexed":false,"internalType":"string[]","name":"signatures","type":"string[]"},{"indexed":false,"internalType":"bytes[]","name":"calldatas","type":"bytes[]"},{"indexed":false,"internalType":"uint256","name":"startBlock","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"endBlock","type":"uint256"},{"indexed":false,"internalType":"string","name":"description","type":"string"}],"name":"ProposalCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"proposalId","type":"uint256"}],"name":"ProposalExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"proposalId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"eta","type":"uint256"}],"name":"ProposalQueued","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"voter","type":"address"},{"indexed":false,"internalType":"uint256","name":"proposalId","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"support","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"weight","type":"uint256"},{"indexed":false,"internalType":"string","name":"reason","type":"string"}],"name":"VoteCast","type":"event"}] as const

export class GovernorEvents {
  constructor(
    private readonly client: EVMClient,
    public readonly address: Address,
  ) {}

  writeReport(
    runtime: Runtime<unknown>,
    callData: Hex,
    gasConfig?: { gasLimit?: string },
  ) {
    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  /**
   * Creates a log trigger for ProposalCanceled events.
   * The returned trigger's adapt method decodes the raw log into ProposalCanceledDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerProposalCanceled(
    filters?: ProposalCanceledTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: GovernorEventsABI,
        eventName: 'ProposalCanceled' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
      }
      const encoded = encodeEventTopics({
        abi: GovernorEventsABI,
        eventName: 'ProposalCanceled' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
        }
        return encodeEventTopics({
          abi: GovernorEventsABI,
          eventName: 'ProposalCanceled' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<ProposalCanceledDecoded> => contract.decodeProposalCanceled(rawOutput),
    }
  }

  /**
   * Decodes a log into ProposalCanceled data, preserving all log metadata.
   */
  decodeProposalCanceled(log: EVMLog): DecodedLog<ProposalCanceledDecoded> {
    const decoded = decodeEventLog({
      abi: GovernorEventsABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as ProposalCanceledDecoded }
  }

  /**
   * Creates a log trigger for ProposalCreated events.
   * The returned trigger's adapt method decodes the raw log into ProposalCreatedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerProposalCreated(
    filters?: ProposalCreatedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: GovernorEventsABI,
        eventName: 'ProposalCreated' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
      }
      const encoded = encodeEventTopics({
        abi: GovernorEventsABI,
        eventName: 'ProposalCreated' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
        }
        return encodeEventTopics({
          abi: GovernorEventsABI,
          eventName: 'ProposalCreated' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<ProposalCreatedDecoded> => contract.decodeProposalCreated(rawOutput),
    }
  }

  /**
   * Decodes a log into ProposalCreated data, preserving all log metadata.
   */
  decodeProposalCreated(log: EVMLog): DecodedLog<ProposalCreatedDecoded> {
    const decoded = decodeEventLog({
      abi: GovernorEventsABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as ProposalCreatedDecoded }
  }

  /**
   * Creates a log trigger for ProposalExecuted events.
   * The returned trigger's adapt method decodes the raw log into ProposalExecutedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerProposalExecuted(
    filters?: ProposalExecutedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: GovernorEventsABI,
        eventName: 'ProposalExecuted' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
      }
      const encoded = encodeEventTopics({
        abi: GovernorEventsABI,
        eventName: 'ProposalExecuted' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
        }
        return encodeEventTopics({
          abi: GovernorEventsABI,
          eventName: 'ProposalExecuted' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<ProposalExecutedDecoded> => contract.decodeProposalExecuted(rawOutput),
    }
  }

  /**
   * Decodes a log into ProposalExecuted data, preserving all log metadata.
   */
  decodeProposalExecuted(log: EVMLog): DecodedLog<ProposalExecutedDecoded> {
    const decoded = decodeEventLog({
      abi: GovernorEventsABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as ProposalExecutedDecoded }
  }

  /**
   * Creates a log trigger for ProposalQueued events.
   * The returned trigger's adapt method decodes the raw log into ProposalQueuedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerProposalQueued(
    filters?: ProposalQueuedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: GovernorEventsABI,
        eventName: 'ProposalQueued' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
      }
      const encoded = encodeEventTopics({
        abi: GovernorEventsABI,
        eventName: 'ProposalQueued' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
        }
        return encodeEventTopics({
          abi: GovernorEventsABI,
          eventName: 'ProposalQueued' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<ProposalQueuedDecoded> => contract.decodeProposalQueued(rawOutput),
    }
  }

  /**
   * Decodes a log into ProposalQueued data, preserving all log metadata.
   */
  decodeProposalQueued(log: EVMLog): DecodedLog<ProposalQueuedDecoded> {
    const decoded = decodeEventLog({
      abi: GovernorEventsABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as ProposalQueuedDecoded }
  }

  /**
   * Creates a log trigger for VoteCast events.
   * The returned trigger's adapt method decodes the raw log into VoteCastDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerVoteCast(
    filters?: VoteCastTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: GovernorEventsABI,
        eventName: 'VoteCast' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
        voter: f.voter,
      }
      const encoded = encodeEventTopics({
        abi: GovernorEventsABI,
        eventName: 'VoteCast' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
          voter: f.voter,
        }
        return encodeEventTopics({
          abi: GovernorEventsABI,
          eventName: 'VoteCast' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<VoteCastDecoded> => contract.decodeVoteCast(rawOutput),
    }
  }

  /**
   * Decodes a log into VoteCast data, preserving all log metadata.
   */
  decodeVoteCast(log: EVMLog): DecodedLog<VoteCastDecoded> {
    const decoded = decodeEventLog({
      abi: GovernorEventsABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as VoteCastDecoded }
  }
}

