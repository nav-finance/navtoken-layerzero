// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { OFTAdapter } from "@layerzerolabs/oft-evm/contracts/OFTAdapter.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NavTokenAdapter
 * @notice OFTAdapter for existing NAV token on Berachain
 * @dev This contract wraps your existing Berachain token to enable LayerZero bridging
 */
contract NavTokenAdapter is OFTAdapter {
    constructor(
        address _token,        // Your existing NAV token address on Berachain
        address _lzEndpoint,   // LayerZero endpoint on Berachain
        address _delegate      // Delegate address (can be same as owner)
    ) OFTAdapter(_token, _lzEndpoint, _delegate) Ownable(_delegate) {}
}