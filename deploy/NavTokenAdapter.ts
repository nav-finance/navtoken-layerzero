import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'NavTokenAdapter'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    // Get the LayerZero EndpointV2 deployment
    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    // Get token address from network config
    const networkConfig = hre.config.networks[hre.network.name] as any
    const existingTokenAddress = networkConfig?.oftAdapter?.tokenAddress
    assert(existingTokenAddress, `Missing oftAdapter.tokenAddress in network config for ${hre.network.name}`)

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            existingTokenAddress,           // Existing NAV token address
            endpointV2Deployment.address,   // LayerZero's EndpointV2 address
            deployer,                       // Delegate/owner
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
}

deploy.tags = [contractName]

export default deploy
