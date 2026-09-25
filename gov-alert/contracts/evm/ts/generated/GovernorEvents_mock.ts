// Code generated — DO NOT EDIT.
import type { Address } from 'viem'
import { addContractMock, type ContractMock, type EvmMock } from '@chainlink/cre-sdk/test'

import { GovernorEventsABI } from './GovernorEvents'

export type GovernorEventsMock = {
} & Pick<ContractMock<typeof GovernorEventsABI>, 'writeReport'>

export function newGovernorEventsMock(address: Address, evmMock: EvmMock): GovernorEventsMock {
  return addContractMock(evmMock, { address, abi: GovernorEventsABI }) as GovernorEventsMock
}

