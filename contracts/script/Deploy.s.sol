
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MonadProfileNFT.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MonadProfileNFT nft = new MonadProfileNFT();
        
        console.log("MonadProfileNFT deployed to:", address(nft));
        console.log("Project ID: 2a3cb8da4f7f897a2306f192152dfa98");
        console.log("Update CONTRACT_ADDRESS in app/utils/contractInteraction.ts");
        
        vm.stopBroadcast();
    }
}
