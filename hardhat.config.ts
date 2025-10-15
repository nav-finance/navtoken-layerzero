// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'

import './tasks/index'
import './type-extensions'


// Set your preferred authentication method
//
// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = PRIVATE_KEY
      ? [PRIVATE_KEY]
      : undefined

if (accounts == null) {
    console.warn(
        'Could not find PRIVATE_KEY environment variable. It will not be possible to execute transactions in your example.'
    )
}

const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        // MAINNET NETWORKS
        'base-mainnet': {
            eid: EndpointId.BASE_V2_MAINNET,
            url: process.env.BASE_MAINNET_RPC,
            accounts,
        },
        'berachain-mainnet': {
            eid: EndpointId.BERA_V2_MAINNET,
            url: process.env.BERACHAIN_MAINNET_RPC,
            accounts,
            oftAdapter: {
                tokenAddress: '0x6536cEAD649249cae42FC9bfb1F999429b3ec755', // NAV Token mainnet address
            },
        },
        // TESTNET NETWORKS
        'base-sepolia': {
            eid: EndpointId.BASESEP_V2_TESTNET,
            url: process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
            accounts,
        },
        'bepolia-testnet': {
            eid: EndpointId.BEPOLIA_V2_TESTNET,
            url: process.env.BERACHAIN_BARTIO_RPC,
            accounts,
            oftAdapter: {
                tokenAddress: '0x8Ec3Cc0700aF26ed821fA452c95fa6452c7f062e', // NAV Token testnet address
            },
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
        },
    },
}

export default config
