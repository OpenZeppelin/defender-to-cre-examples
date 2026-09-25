// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { MigrationGovernor } from "../src/MigrationGovernor.sol";
import { MigrationVotesToken } from "../src/MigrationVotesToken.sol";
import { Script } from "forge-std/Script.sol";

contract DeployMigrationGovernor is Script {
    uint256 private constant INITIAL_SUPPLY = 1_000_000 ether;

    function run() external returns (MigrationVotesToken token, MigrationGovernor governor) {
        address deployer = vm.envAddress("MIGRATION_DEPLOYER_ADDRESS");

        vm.startBroadcast();
        token = new MigrationVotesToken(deployer, INITIAL_SUPPLY);
        governor = new MigrationGovernor(token);
        token.delegate(deployer);
        vm.stopBroadcast();

        require(token.balanceOf(deployer) == INITIAL_SUPPLY, "unexpected token holder");
        require(token.delegates(deployer) == deployer, "deployer did not self-delegate");
    }
}
