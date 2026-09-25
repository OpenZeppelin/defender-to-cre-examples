// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { MigrationGovernor } from "../src/MigrationGovernor.sol";
import { MigrationVotesToken } from "../src/MigrationVotesToken.sol";
import { Test } from "forge-std/Test.sol";

contract MigrationGovernorTest is Test {
    MigrationVotesToken private token;
    MigrationGovernor private governor;
    address private voter = makeAddr("voter");

    function setUp() public {
        token = new MigrationVotesToken(voter, 1_000_000 ether);
        governor = new MigrationGovernor(token);

        vm.prank(voter);
        token.delegate(voter);
        vm.roll(block.number + 1);
    }

    function testFixtureUsesShortControlledSettings() public view {
        assertEq(governor.proposalThreshold(), 0);
        assertEq(governor.votingDelay(), 1);
        assertEq(governor.votingPeriod(), 12);
        assertEq(token.getVotes(voter), 1_000_000 ether);
    }

    function testCreatesProposalAndCastsReasonBearingVote() public {
        (address[] memory targets, uint256[] memory values, bytes[] memory calldatas) = _harmlessProposal();

        vm.prank(voter);
        uint256 proposalId = governor.propose(targets, values, calldatas, "# CRE migration validation");

        vm.roll(governor.proposalSnapshot(proposalId) + 1);
        vm.prank(voter);
        uint256 weight = governor.castVoteWithReason(proposalId, 1, "validated locally");

        assertEq(weight, 1_000_000 ether);
        assertTrue(governor.hasVoted(proposalId, voter));
    }

    function harmlessCall() external pure returns (bytes32) {
        return keccak256("CRE_GOVERNANCE_ALERT_VALIDATION");
    }

    function _harmlessProposal()
        private
        view
        returns (address[] memory targets, uint256[] memory values, bytes[] memory calldatas)
    {
        targets = new address[](1);
        values = new uint256[](1);
        calldatas = new bytes[](1);
        targets[0] = address(this);
        calldatas[0] = abi.encodeCall(this.harmlessCall, ());
    }
}
