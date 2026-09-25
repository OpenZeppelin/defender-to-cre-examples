// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Governor } from "@openzeppelin/contracts/governance/Governor.sol";
import { GovernorCountingSimple } from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import { GovernorVotes } from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import { GovernorVotesQuorumFraction } from
    "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";

/// @dev Test-only Governor with short block-based voting settings.
contract MigrationGovernor is Governor, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction {
    constructor(IVotes token_)
        Governor("CRE Migration Governor")
        GovernorVotes(token_)
        GovernorVotesQuorumFraction(0)
    { }

    function votingDelay() public pure override returns (uint256) {
        return 1;
    }

    function votingPeriod() public pure override returns (uint256) {
        return 12;
    }

    function proposalThreshold() public pure override returns (uint256) {
        return 0;
    }
}
