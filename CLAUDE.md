# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a LayerZero V2 cross-chain token bridge project that enables NAV token transfers between Base Sepolia and Berachain Bartio testnets using the OFT (Omnichain Fungible Token) standard.

**Architecture Pattern:**
- **NavTokenHub** (Base Sepolia): Native OFT implementation - mints/burns tokens on Base
- **NavTokenAdapter** (Berachain Bartio): OFT Adapter - wraps existing ERC20 token on Berachain
- **LayerZero Protocol**: Handles cross-chain messaging, verification (DVNs), and execution

The dual contract approach (Hub + Adapter) allows bridging an existing token on one chain while having a native OFT on another.

## Development Commands

### Build & Compile
```bash
# Compile both Hardhat and Forge
pnpm compile

# Compile individually
pnpm compile:hardhat
pnpm compile:forge

# Clean build artifacts
pnpm clean
```

### Testing
```bash
# Run all tests (Hardhat + Forge)
pnpm test

# Run individually
pnpm test:hardhat
pnpm test:forge
```

### Linting
```bash
# Check code style
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

### Deployment & Configuration

**Deploy contracts:**
```bash
# Deploy NavTokenHub, NavTokenAdapter, or test contracts
pnpm hardhat lz:deploy --tags <ContractName>

# Available tags: NavTokenHub, NavTokenAdapter, MyOFTMock, SimpleDVNMock, SimpleExecutorMock
```

**Configure cross-chain pathways:**
```bash
# Wire contracts using layerzero.config.ts
pnpm hardhat lz:oapp:wire --oapp-config layerzero.config.ts

# View current configuration
pnpm hardhat lz:oapp:config:get --oapp-config layerzero.config.ts
```

**Send cross-chain tokens:**
```bash
# Send tokens between chains
pnpm hardhat lz:oft:send --src-eid <SOURCE_EID> --dst-eid <DEST_EID> --amount <AMOUNT> --to <ADDRESS>

# Example: Base Sepolia (40245) → Berachain Bartio (40291)
pnpm hardhat lz:oft:send --src-eid 40245 --dst-eid 40291 --amount 1000000000000000000 --to 0x...

# For testnets with Simple Workers (manual verification):
pnpm hardhat lz:oft:send --src-eid 40245 --dst-eid 40291 --amount 1 --to 0x... --simple-workers
```

**Gas profiling:**
```bash
# Profile lzReceive gas usage
pnpm gas:lzReceive <rpcUrl> <endpointAddress> <srcEid> <sender> <dstEid> <receiver> <message> <msgValue> <numOfRuns>

# Profile lzCompose gas usage
pnpm gas:lzCompose <rpcUrl> <endpointAddress> <srcEid> <sender> <dstEid> <receiver> <composer> <composeMsg> <msgValue> <numOfRuns>
```

## Configuration Files

### Network Configuration ([hardhat.config.ts](hardhat.config.ts))
Defines deployment networks with their RPC URLs and endpoint IDs:
- `base-sepolia`: Base Sepolia testnet (eid: 40245)
- `berachain-bartio`: Berachain Bartio testnet (eid: 40291)

Update with production networks before mainnet deployment.

### LayerZero Configuration ([layerzero.config.ts](layerzero.config.ts))

**Structure:**
1. **Contract definitions**: Specifies which contracts to deploy on which chains
2. **Gas options**: Enforced execution options for `lzReceive` (default: 80000 gas)
3. **Pathways**: Bidirectional messaging routes between chains

**Current Configuration:**
- Base Sepolia (40245) ↔ Berachain Bartio (40291)
- DVN: LayerZero Labs (default)
- Confirmations: 1 block on both chains
- Enforced gas: 80000 for `lzReceive`

**Modifying Configuration:**
```typescript
// To add a new chain pathway:
const newChainContract: OmniPointHardhat = {
    eid: EndpointId.NEW_CHAIN_V2_TESTNET,
    contractName: 'NavTokenHub', // or 'NavTokenAdapter'
}

// Add to pathways array:
const pathways: TwoWayConfig[] = [
    [baseContract, berachainContract, [['LayerZero Labs'], []], [1, 1], [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS]],
    [baseContract, newChainContract, [['LayerZero Labs'], []], [1, 1], [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS]],
]
```

### Environment Setup (.env)
Required variables:
```bash
PRIVATE_KEY=0x...        # Deployer private key
BASE_SEPOLIA_RPC=...     # Base Sepolia RPC URL
BERACHAIN_BARTIO_RPC=... # Berachain Bartio RPC URL
```

## Key Contracts

### NavTokenHub ([contracts/NavTokenHub.sol](contracts/NavTokenHub.sol:1-14))
- Extends LayerZero's `OFT` contract
- Deployed on Base Sepolia as the primary token hub
- Mints and burns tokens for cross-chain transfers
- Uses standard ERC20 naming (set via constructor)

### NavTokenAdapter ([contracts/NavTokenAdapter.sol](contracts/NavTokenAdapter.sol:1-18))
- Extends LayerZero's `OFTAdapter` contract
- Deployed on Berachain to wrap existing NAV token
- Locks/unlocks existing tokens instead of mint/burn
- Requires existing token address in constructor

### Simple Workers (Testing Only)
Located in [contracts/mocks/](contracts/mocks/):
- **SimpleDVNMock**: Manual message verification for testnets without DVNs
- **SimpleExecutorMock**: Zero-fee executor for testing
- **NEVER use in production** - no security guarantees

Deploy and configure per [CUSTOM_WORKERS_GUIDE.md](CUSTOM_WORKERS_GUIDE.md).

## Critical Development Notes

### Pre-Production Checklist
1. **Remove MyOFTMock**: Never deploy the mock contract with public `mint()` to production
2. **Profile gas usage**: Use `gas:lzReceive` and `gas:lzCompose` to set accurate gas limits in enforced options
3. **Update DVN configuration**: Review security stack and confirmations for production chains
4. **Test token mechanics**:
   - NavTokenHub: Verify mint/burn works correctly
   - NavTokenAdapter: Verify the wrapped token address is correct
5. **Verify endpoint IDs**: Double-check all endpoint IDs match target networks

### Gas Configuration
The `gas` parameter in enforced options (`EVM_ENFORCED_OPTIONS`) MUST be profiled per destination chain:
```typescript
// Default is 80000 - profile actual usage before production!
const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
    {
        msgType: 1,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 80000, // ← Profile this value
        value: 0,
    },
]
```

### Deployment Order
1. Deploy contracts on all chains (`lz:deploy`)
2. Configure pathways (`lz:oapp:wire`)
3. Fund deployer with native gas tokens on all chains
4. Test with small amounts first
5. Verify on LayerZero Scan before production use

### Custom DVN/Executor Configuration
For custom security configurations or testnets without default workers:
1. Deploy custom DVN/Executor contracts on each chain
2. Get deployed addresses from `./deployments/<network>/`
3. Update `layerzero.config.ts` (not `layerzero.simple-worker.config.ts`)
4. See [CUSTOM_WORKERS_GUIDE.md](CUSTOM_WORKERS_GUIDE.md) for detailed instructions

### Message Ordering
LayerZero enforces ordered delivery per channel (source → destination). If a message fails:
- All subsequent messages on that channel are blocked
- Must either process or skip the failed message
- Skipping is permanent and unrecoverable

### Troubleshooting Resources
- Debugging: https://docs.layerzero.network/v2/developers/evm/troubleshooting/debugging-messages
- Error codes: https://docs.layerzero.network/v2/developers/evm/troubleshooting/error-messages
- LayerZero Scan: Track message delivery and status

## Project Structure

```
contracts/
├── NavTokenHub.sol          # OFT hub (mint/burn)
├── NavTokenAdapter.sol      # OFT adapter (lock/unlock)
└── mocks/                   # Test-only contracts

deploy/                      # Hardhat deploy scripts
├── MyOFTMock.ts
├── SimpleDVNMock.ts
└── SimpleExecutorMock.ts

tasks/                       # Custom Hardhat tasks
├── sendOFT.ts              # Send tokens cross-chain
├── commitAndExecute.ts     # Manual message execution
└── simple-workers-mock/    # Simple worker utilities

test/                        # Test suites
├── hardhat/                # Hardhat tests
├── foundry/                # Forge tests
└── mocks/                  # Mock-specific tests

layerzero.config.ts         # LayerZero pathway configuration
hardhat.config.ts           # Network and compiler settings
```

## Testing Single Tests

### Hardhat
```bash
# Run single test file
pnpm hardhat test test/hardhat/MyOFT.test.ts

# Run with gas reporting
REPORT_GAS=true pnpm hardhat test
```

### Forge
```bash
# Run single test
forge test --match-test testFunctionName

# Run test file
forge test --match-path test/foundry/MyOFT.t.sol

# Verbose output
forge test -vvvv
```

## Endpoint IDs Reference

Common testnets configured in this project:
- Base Sepolia: `40245` (EndpointId.BASESEP_V2_TESTNET)
- Berachain Bartio: `40291` (EndpointId.BERA_V2_TESTNET)

Full list: https://docs.layerzero.network/v2/deployments/deployed-contracts
