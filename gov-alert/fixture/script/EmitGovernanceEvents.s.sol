// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { MigrationGovernor } from "../src/MigrationGovernor.sol";
import { Script } from "forge-std/Script.sol";

contract EmitGovernanceEvents is Script {
    function createProposal() external returns (uint256 proposalId) {
        MigrationGovernor governor = MigrationGovernor(payable(vm.envAddress("MIGRATION_GOVERNOR_ADDRESS")));
        string memory description = vm.envString("MIGRATION_PROPOSAL_DESCRIPTION");

        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(governor);
        calldatas[0] = abi.encodeCall(governor.name, ());

        vm.startBroadcast();
        proposalId = governor.propose(targets, values, calldatas, description);
        vm.stopBroadcast();
    }

    function castVote() external returns (uint256 weight) {
        MigrationGovernor governor = MigrationGovernor(payable(vm.envAddress("MIGRATION_GOVERNOR_ADDRESS")));
        uint256 proposalId = vm.envUint("MIGRATION_PROPOSAL_ID");

        vm.startBroadcast();
        weight = governor.castVoteWithReason(proposalId, 1, "CRE migration validation");
        vm.stopBroadcast();
    }
}
