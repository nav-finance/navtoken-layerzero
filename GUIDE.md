# NAV LayerZero Bridge - Mainnet Deployment Guide

**Date:** 14/10/2025
**Deployer:** @cryptobenkei
**DEPLOYER Address:** 0x18bD8e16bc7D7324432a1bdCa3Ee535694f76E0A

> **CRITICAL:** This is a one-way process. Once ownership is transferred to SAFE, the deployer wallet loses all control. Follow each step carefully and verify before proceeding.

---

## Overview

This guide deploys a LayerZero OFT bridge between:
- **Base Mainnet** - NavTokenHub (mint/burn OFT)
- **Berachain Mainnet** - NavTokenAdapter (wraps existing NAV token)

**Security Configuration:**
- 3 Required DVNs: Canary, Deutsche Telekom, Nansen
- Confirmations: Base→Berachain (15 blocks), Berachain→Base (20 blocks)
- Gas limit: 80,000 (update after profiling)

---

## PHASE 0: Pre-Deployment Verification

### 0.1 Environment Setup
- [x] Clean repository state: `git status` shows no uncommitted changes
- [x] Install dependencies: `pnpm install`
- [x] Clean build: `pnpm clean && pnpm compile`

### 0.2 Verify NAV Token on Berachain Mainnet

**NAV Token Address (from hardhat.config.ts):** `0x6536cEAD649249cae42FC9bfb1F999429b3ec755`
Berascan : https://berascan.com/token/0x6536cead649249cae42fc9bfb1f999429b3ec755

Run verification commands:
 
### 0.3 Review Configuration Files

**mainnet.layerzero.config.ts:**
- [x] Endpoint IDs: BASE_V2_MAINNET (30184), BERA_V2_MAINNET (30290)
- [x] Contract names: NavTokenHub, NavTokenAdapter
- [x] DVNs: Canary, Deutsche Telekom, Nansen (3 required)
- [x] Confirmations: 15 (Base→Bera), 20 (Bera→Base)
- [x] Gas limit: 80000

**hardhat.config.ts:**
- [X] Base Mainnet RPC configured
- [X] Berachain Mainnet RPC configured
- [x] NAV token address verified: `0x6536cEAD649249cae42FC9bfb1F999429b3ec755`

---

## PHASE 1: Deployment Wallet Setup

### 1.1 Create Clean Deployer Wallet

**✅ USING ENCRYPTED KEYSTORE**

```bash
# Create encrypted keystore wallet (ALREADY DONE)
# cast wallet new ~/.foundry/keystores/deployer

# Get the deployer address
cast wallet address --keystore ~/.foundry/keystores/deployer
```

**Keystore File:** `~/.foundry/keystores/deployer/4638f6f1-be42-4c5b-8083-31908323d94c`
**Deployer Wallet Address:** 0x18bD8e16bc7D7324432a1bdCa3Ee535694f76E0A

```bash
# Create .env.mainnet file (for RPC URLs only - NO PRIVATE KEY)
cat > .env.mainnet << 'EOF'
BASE_MAINNET_RPC=https://base-mainnet.g.alchemy.com/v2/___YOUR_KEY___
BERACHAIN_MAINNET_RPC=https://berachain-mainnet.g.alchemy.com/v2/___YOUR_KEY___
EOF

# Ensure .env.mainnet is in .gitignore
echo ".env.mainnet" >> .gitignore
```

**Security Checklist:**
- [x] Deployer wallet created with encrypted keystore ✓
- [ ] Keystore password stored securely (NOT in files)
- [ ] `.env.mainnet` contains ONLY RPC URLs (no private key) ✓
- [ ] `.env.mainnet` added to `.gitignore`
- [ ] **VERIFIED:** `.env.mainnet` NOT tracked by git
- [x] Deployer address recorded: `0x18bD8e16bc7D7324432a1bdCa3Ee535694f76E0A` ✓

---

## PHASE 2: Verify SAFE Control & Fund Deployer

**Goal:** Verify SAFE multisig control on both chains AND fund deployer wallet in one transaction per chain.

### 2.1 Verify Base SAFE & Fund Deployer

**Base SAFE Address:** `0x735698e050da63a3ce02488b6cd6714b8e459a09`

```bash
export BASE_MAINNET_RPC="https://mainnet.base.org"  # or your RPC URL
export SAFE_ADDRESS=0x735698e050da63a3ce02488b6cd6714b8e459a09
export DEPLOYER_ADDRESS=0x18bD8e16bc7D7324432a1bdCa3Ee535694f76E0A

# 1. Verify SAFE configuration
cast call $SAFE_ADDRESS "getOwners()" --rpc-url $BASE_MAINNET_RPC
cast call $SAFE_ADDRESS "getThreshold()" --rpc-url $BASE_MAINNET_RPC
cast call $SAFE_ADDRESS "nonce()" --rpc-url $BASE_MAINNET_RPC

# 2. Check SAFE balance
cast balance $SAFE_ADDRESS --rpc-url $BASE_MAINNET_RPC --ether
```

**Expected SAFE Configuration:**
- [x] SAFE exists on Base Mainnet ✓
- [x] Number of owners: 3
- [x] Threshold: 2 (signatures required)
- [x] Current signers:
  - [x] 0xcac4617a0aa4c57245fe2fb15e78bc21c2e535c1
  - [x] 0xf13f7bf69a5e57ea3367222c65dd3380096d3fbf
  - [x] 0x735698e050da63a3ce02488b6cd6714b8e459a09
- [ ] All signers have access to their keys ✓
- [ ] SAFE has sufficient balance (≥ 0.02 ETH) ✓

**Send 0.02 ETH from SAFE → Deployer** (verifies SAFE control + funds deployer):

**Funding Breakdown:**
- Deployment: ~0.005 ETH
- Configuration: ~0.003 ETH
- Testing: ~0.010 ETH
- Buffer: ~0.002 ETH
- **Total: 0.02 ETH**

Using SAFE UI (https://app.safe.global/):
1. Connect to Base Mainnet
2. Load SAFE: `0x735698e050da63a3ce02488b6cd6714b8e459a09`
3. Create transaction: Send **0.02 ETH** to `0x18bD8e16bc7D7324432a1bdCa3Ee535694f76E0A`
4. Sign with required signers (threshold: 2)
5. Execute transaction

**Checklist:**
- [ ] Transaction created in SAFE UI
- [ ] All required signers signed (2/3) ✓
- [ ] Transaction executed successfully
- [ ] Transaction hash: _________________
- [ ] **CONFIRMED:** Base SAFE control verified ✓
- [ ] **CONFIRMED:** Deployer funded ✓

Verify deployer received funds:
```bash
cast balance $DEPLOYER_ADDRESS --rpc-url $BASE_MAINNET_RPC --ether
```
- [ ] Deployer balance: ≥ 0.02 ETH ✓

---

### 2.2 Verify Berachain SAFE & Fund Deployer

**Berachain SAFE Address:** `0x8F9Ae98d1670ECb6407FE7B2EA993C0AD7ac80e1`

```bash
export BERACHAIN_MAINNET_RPC="<your-berachain-rpc>"
export SAFE_ADDRESS=0x8F9Ae98d1670ECb6407FE7B2EA993C0AD7ac80e1
export DEPLOYER_ADDRESS=0x18bD8e16bc7D7324432a1bdCa3Ee535694f76E0A

# 1. Verify SAFE configuration
cast call $SAFE_ADDRESS "getOwners()" --rpc-url $BERACHAIN_MAINNET_RPC
cast call $SAFE_ADDRESS "getThreshold()" --rpc-url $BERACHAIN_MAINNET_RPC
cast call $SAFE_ADDRESS "nonce()" --rpc-url $BERACHAIN_MAINNET_RPC

# 2. Check SAFE balance
cast balance $SAFE_ADDRESS --rpc-url $BERACHAIN_MAINNET_RPC --ether
```

**Expected SAFE Configuration:**
- [x] SAFE exists on Berachain Mainnet ✓
- [x] Number of owners: 3 (matches Base SAFE)
- [x] Threshold: 2 (matches Base SAFE)
- [x] Signers match Base SAFE ✓
- [x] Nonce: 31 (has transaction history) ✓
- [ ] SAFE has sufficient balance (≥ 10 BERA) ✓

**Send 10 BERA from SAFE → Deployer** (verifies SAFE control + funds deployer):

Using SAFE UI:
1. Connect to Berachain Mainnet
2. Load SAFE: `0x8F9Ae98d1670ECb6407FE7B2EA993C0AD7ac80e1`
3. Create transaction: Send **10 BERA** to `0x18bD8e16bc7D7324432a1bdCa3Ee535694f76E0A`
4. Sign with required signers (threshold: 2)
5. Execute transaction

**Checklist:**
- [ ] Transaction created in SAFE UI
- [ ] All required signers signed (2/3) ✓
- [ ] Transaction executed successfully
- [ ] Transaction hash: _________________
- [ ] **CONFIRMED:** Berachain SAFE control verified ✓
- [ ] **CONFIRMED:** Deployer funded ✓

Verify deployer received funds:
```bash
cast balance $DEPLOYER_ADDRESS --rpc-url $BERACHAIN_MAINNET_RPC --ether
```
- [ ] Deployer balance: ≥ 10 BERA ✓

---

## PHASE 3: Contract Deployment

**Before Starting:** Ensure you have your keystore password ready. You'll be prompted for it when exporting the private key.

### Environment Setup (Run Once)

```bash
# Load RPC URLs from .env.mainnet
export $(cat .env.mainnet | xargs)

# Set keystore path
export KEYSTORE_PATH=~/.foundry/keystores/deployer

# Export private key from keystore (will prompt for password)
export PRIVATE_KEY=$(cast wallet private-key --keystore $KEYSTORE_PATH)

# Verify deployer address
echo "Deployer address: $(cast wallet address --keystore $KEYSTORE_PATH)"
```

**Security Note:** The `PRIVATE_KEY` is now in your environment. Clear it after all deployments with `unset PRIVATE_KEY`.

---

### 3.1 Deploy NavTokenHub on Base Mainnet

```bash
# Deploy NavTokenHub (assumes environment is set up from section above)
pnpm hardhat lz:deploy \
  --network base-mainnet \
  --tags NavTokenHub
```

**Expected Output:**
```
Network: base-mainnet
Deployer: <deployer-address>
Deployed contract: NavTokenHub, address: 0x...
```

- [ ] Deployment transaction sent
- [ ] Transaction hash: _________________
- [ ] **NavTokenHub Address:** _________________
- [ ] Gas used: _________________
- [ ] Deployment successful ✓

#### Verify NavTokenHub Deployment

```bash
export NAVTOKEN_HUB=<deployed-address>

# Check owner
cast call $NAVTOKEN_HUB "owner()" --rpc-url $BASE_MAINNET_RPC

# Check endpoint
cast call $NAVTOKEN_HUB "endpoint()" --rpc-url $BASE_MAINNET_RPC

# Check token name
cast call $NAVTOKEN_HUB "name()" --rpc-url $BASE_MAINNET_RPC

# Check token symbol
cast call $NAVTOKEN_HUB "symbol()" --rpc-url $BASE_MAINNET_RPC

# Check decimals
cast call $NAVTOKEN_HUB "decimals()" --rpc-url $BASE_MAINNET_RPC
```

**Verification:**
- [ ] Owner: `<deployer-address>` ✓
- [ ] Endpoint: _________________ (LayerZero EndpointV2)
- [ ] Name: "NAV Token" ✓
- [ ] Symbol: "NAV" ✓
- [ ] Decimals: 18 ✓
- [ ] **Verify on BaseScan:** https://basescan.org/address/`<navtokenhub-address>`
- [ ] Contract shows on block explorer ✓

### 3.2 Deploy NavTokenAdapter on Berachain Mainnet

```bash
# Deploy NavTokenAdapter (assumes environment is set up)
pnpm hardhat lz:deploy \
  --network berachain-mainnet \
  --tags NavTokenAdapter
```

**Expected Output:**
```
Network: berachain-mainnet
Deployer: <deployer-address>
Deployed contract: NavTokenAdapter, address: 0x...
```

- [ ] Deployment transaction sent
- [ ] Transaction hash: _________________
- [ ] **NavTokenAdapter Address:** _________________
- [ ] Gas used: _________________
- [ ] Deployment successful ✓

#### Verify NavTokenAdapter Deployment

```bash
export NAVTOKEN_ADAPTER=<deployed-address>

# Check owner
cast call $NAVTOKEN_ADAPTER "owner()" --rpc-url $BERACHAIN_MAINNET_RPC

# Check endpoint
cast call $NAVTOKEN_ADAPTER "endpoint()" --rpc-url $BERACHAIN_MAINNET_RPC

# Check wrapped token address (CRITICAL!)
cast call $NAVTOKEN_ADAPTER "token()" --rpc-url $BERACHAIN_MAINNET_RPC
```

**Verification:**
- [ ] Owner: `<deployer-address>` ✓
- [ ] Endpoint: _________________ (LayerZero EndpointV2)
- [ ] **CRITICAL - Wrapped Token:** `0x6536cEAD649249cae42FC9bfb1F999429b3ec755` ✓
- [ ] **CONFIRMED:** Adapter is wrapping the CORRECT NAV token ✓
- [ ] **Verify on Berachain Explorer:** https://explorer.berachain.com/address/`<navtokenadapter-address>`
- [ ] Contract shows on block explorer ✓

### 3.3 Record Deployment Addresses

**📋 Deployment Record:**

| Contract | Network | Address |
|----------|---------|---------|
| NavTokenHub | Base Mainnet | _________________ |
| NavTokenAdapter | Berachain Mainnet | _________________ |
| NAV Token (existing) | Berachain Mainnet | 0x6536cEAD649249cae42FC9bfb1F999429b3ec755 |

- [ ] All addresses recorded ✓
- [ ] Backup created: `cp GUIDE.md GUIDE-deployment-record.md`

### 3.4 Clean Up Environment

```bash
# IMPORTANT: Clear private key from environment after all deployments
unset PRIVATE_KEY
unset KEYSTORE_PATH

# Verify it's cleared
echo $PRIVATE_KEY  # Should print nothing
```

- [ ] Private key cleared from environment ✓
- [ ] Environment variables cleaned up ✓

---

## PHASE 4: LayerZero Configuration

### 4.1 Wire Contracts with mainnet.layerzero.config.ts

**This will:**
- Set peer on NavTokenHub → NavTokenAdapter
- Set peer on NavTokenAdapter → NavTokenHub
- Configure 3 DVNs: Canary, Deutsche Telekom, Nansen
- Set executors
- Configure enforced options (gas limits)
- Set confirmations (10 and 20 blocks)

```bash
# Wire contracts using mainnet configuration
pnpm hardhat lz:oapp:wire \
  --oapp-config mainnet.layerzero.config.ts
```

**⚠️ REVIEW EACH TRANSACTION CAREFULLY BEFORE CONFIRMING**

This will create multiple transactions (expect ~6-12 txs for 3 DVNs):
1. setPeer on Base
2. setPeer on Berachain
3. setConfig for send library (Base)
4. setConfig for receive library (Base)
5. setConfig for send library (Berachain)
6. setConfig for receive library (Berachain)
7-12. DVN and executor configurations

**Transaction Log:**

| # | Network | Function | Tx Hash | Status |
|---|---------|----------|---------|--------|
| 1 | Base | setPeer | __________ | [ ] ✓ |
| 2 | Berachain | setPeer | __________ | [ ] ✓ |
| 3 | Base | setConfig (send) | __________ | [ ] ✓ |
| 4 | Base | setConfig (receive) | __________ | [ ] ✓ |
| 5 | Berachain | setConfig (send) | __________ | [ ] ✓ |
| 6 | Berachain | setConfig (receive) | __________ | [ ] ✓ |
| 7 | Base | setEnforcedOptions | __________ | [ ] ✓ |
| 8 | Berachain | setEnforcedOptions | __________ | [ ] ✓ |

- [ ] All wiring transactions completed ✓
- [ ] No transaction reverted ✓
- [ ] Total gas spent: __________ ETH (Base) + __________ BERA (Berachain)

### 4.2 Verify Configuration

```bash
# View applied configuration
pnpm hardhat lz:oapp:config:get \
  --oapp-config mainnet.layerzero.config.ts
```

**Manual Peer Verification:**

```bash
# Check peer on Base → Berachain (eid: 30290)
cast call $NAVTOKEN_HUB \
  "peers(uint32)" 30290 \
  --rpc-url $BASE_MAINNET_RPC

# Check peer on Berachain → Base (eid: 30184)
cast call $NAVTOKEN_ADAPTER \
  "peers(uint32)" 30184 \
  --rpc-url $BERACHAIN_MAINNET_RPC
```

**Configuration Checklist:**
- [ ] Base NavTokenHub peer set to NavTokenAdapter ✓
- [ ] Berachain NavTokenAdapter peer set to NavTokenHub ✓
- [ ] DVNs configured:
  - [ ] Canary ✓
  - [ ] Deutsche Telekom ✓
  - [ ] Nansen ✓
- [ ] Executors configured ✓
- [ ] Enforced options set (gas: _______) ✓
- [ ] Confirmations: 10 (Base→Bera), 20 (Bera→Base) ✓
- [ ] **Configuration verified on LayerZero Scan** ✓

---

## PHASE 5: Comprehensive Testing

**⚠️ START WITH SMALL AMOUNTS - DO NOT RISK LARGE SUMS**

### 5.1 Test Base → Berachain (10 NAV)

#### Step 1: Mint NAV on Base

```bash
# Mint 100 NAV to deployer (for testing)
cast send $NAVTOKEN_HUB \
  "mint(address,uint256)" \
  <deployer-address> \
  100000000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_MAINNET_RPC
```

- [ ] Mint transaction sent
- [ ] Transaction hash: _________________
- [ ] Minted 100 NAV ✓

Verify balance:
```bash
cast call $NAVTOKEN_HUB "balanceOf(address)" <deployer-address> --rpc-url $BASE_MAINNET_RPC
```
- [ ] Balance: 100 NAV (100000000000000000000) ✓

#### Step 2: Send NAV Cross-Chain

```bash
# Send 10 NAV from Base → Berachain
pnpm hardhat lz:oft:send \
  --network base-mainnet \
  --src-eid 30184 \
  --dst-eid 30290 \
  --amount 10000000000000000000 \
  --to <deployer-address>
```

- [ ] Send transaction initiated
- [ ] Transaction hash: _________________
- [ ] LayerZero message ID: _________________
- [ ] **Track on LayerZero Scan:** https://layerzeroscan.com/

#### Step 3: Monitor Message Verification

**⏱️ Expected time: 5-15 minutes (3 DVNs + 10 confirmations)**

LayerZero Scan monitoring:
- [ ] Message received by Base endpoint ✓
- [ ] Waiting for confirmations (10 blocks) ✓
- [ ] Canary DVN verified ✓
- [ ] Deutsche Telekom DVN verified ✓
- [ ] Nansen DVN verified ✓
- [ ] Message ready for execution ✓
- [ ] Executor submitted transaction ✓
- [ ] Message delivered to Berachain ✓

**Verification Time Log:**
- Sent at: _________
- Confirmed at (10 blocks): _________
- All DVNs verified at: _________
- Executed at: _________
- **Total time:** _________ minutes

#### Step 4: Verify Receipt on Berachain

```bash
# Check NAV balance on Berachain
cast call 0x6536cEAD649249cae42FC9bfb1F999429b3ec755 \
  "balanceOf(address)" <deployer-address> \
  --rpc-url $BERACHAIN_MAINNET_RPC
```

- [ ] Balance on Berachain: 10 NAV ✓
- [ ] **Test 1 (Base → Berachain) SUCCESS** ✓

### 5.2 Test Berachain → Base (5 NAV)

#### Step 1: Approve NavTokenAdapter

```bash
# Approve adapter to spend NAV
cast send 0x6536cEAD649249cae42FC9bfb1F999429b3ec755 \
  "approve(address,uint256)" \
  $NAVTOKEN_ADAPTER \
  5000000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $BERACHAIN_MAINNET_RPC
```

- [ ] Approval transaction sent
- [ ] Transaction hash: _________________
- [ ] Approved 5 NAV ✓

#### Step 2: Send NAV Cross-Chain

```bash
# Send 5 NAV from Berachain → Base
pnpm hardhat lz:oft:send \
  --network berachain-mainnet \
  --src-eid 30290 \
  --dst-eid 30184 \
  --amount 5000000000000000000 \
  --to <deployer-address>
```

- [ ] Send transaction initiated
- [ ] Transaction hash: _________________
- [ ] LayerZero message ID: _________________
- [ ] **Track on LayerZero Scan:** https://layerzeroscan.com/

#### Step 3: Monitor Message Verification

**⏱️ Expected time: 10-20 minutes (3 DVNs + 20 confirmations)**

LayerZero Scan monitoring:
- [ ] Message received by Berachain endpoint ✓
- [ ] Waiting for confirmations (20 blocks) ✓
- [ ] Canary DVN verified ✓
- [ ] Deutsche Telekom DVN verified ✓
- [ ] Nansen DVN verified ✓
- [ ] Message ready for execution ✓
- [ ] Executor submitted transaction ✓
- [ ] Message delivered to Base ✓

**Verification Time Log:**
- Sent at: _________
- Confirmed at (20 blocks): _________
- All DVNs verified at: _________
- Executed at: _________
- **Total time:** _________ minutes

#### Step 4: Verify Receipt on Base

```bash
# Check NAV balance on Base
cast call $NAVTOKEN_HUB "balanceOf(address)" <deployer-address> --rpc-url $BASE_MAINNET_RPC
```

Expected: 90 NAV (minted 100, sent 10, received back 5)

- [ ] Balance on Base: 95 NAV ✓
- [ ] **Test 2 (Berachain → Base) SUCCESS** ✓

### 5.3 Test Edge Cases

#### Test 3: Different Amount (1 NAV)

Base → Berachain:
```bash
pnpm hardhat lz:oft:send \
  --network base-mainnet \
  --src-eid 30184 \
  --dst-eid 30290 \
  --amount 1000000000000000000 \
  --to <deployer-address>
```

- [ ] Transaction hash: _________________
- [ ] Delivered successfully ✓
- [ ] Correct amount received ✓

#### Test 4: Different Recipient

Base → Berachain (to different address):
```bash
pnpm hardhat lz:oft:send \
  --network base-mainnet \
  --src-eid 30184 \
  --dst-eid 30290 \
  --amount 2000000000000000000 \
  --to <different-test-address>
```

- [ ] Transaction hash: _________________
- [ ] Delivered to different address ✓
- [ ] Correct recipient received tokens ✓

#### Test 5: Message Ordering

Send 3 sequential transactions:
```bash
# Transaction 1
pnpm hardhat lz:oft:send --network base-mainnet --src-eid 30184 --dst-eid 30290 --amount 1000000000000000000 --to <deployer>

# Transaction 2
pnpm hardhat lz:oft:send --network base-mainnet --src-eid 30184 --dst-eid 30290 --amount 2000000000000000000 --to <deployer>

# Transaction 3
pnpm hardhat lz:oft:send --network base-mainnet --src-eid 30184 --dst-eid 30290 --amount 3000000000000000000 --to <deployer>
```

- [ ] Tx 1 hash: _________________
- [ ] Tx 2 hash: _________________
- [ ] Tx 3 hash: _________________
- [ ] All delivered in order ✓
- [ ] No messages blocked ✓

### 5.4 Test Summary

**Total Tests:** 5
- [ ] Test 1: Base → Berachain (10 NAV) ✓
- [ ] Test 2: Berachain → Base (5 NAV) ✓
- [ ] Test 3: Small amount (1 NAV) ✓
- [ ] Test 4: Different recipient ✓
- [ ] Test 5: Message ordering ✓

**Performance Metrics:**
- Average Base → Berachain time: _________ minutes
- Average Berachain → Base time: _________ minutes
- Average gas cost (Base): _________ ETH
- Average gas cost (Berachain): _________ BERA
- Average DVN fees: $_________ per message

**Issues Found:**
- [ ] None - all tests passed ✓
- [ ] Issues found (document below):

_______________________________________________________
_______________________________________________________
_______________________________________________________

---

## PHASE 6: Transfer Ownership to SAFE

**🚨 CRITICAL: POINT OF NO RETURN**

Once ownership is transferred, the deployer wallet loses ALL control. The SAFE becomes the sole owner and only way to manage the contracts.

**Before proceeding, verify:**
- [ ] All tests passed ✓
- [ ] Bridge working perfectly ✓
- [ ] SAFE control verified on both chains ✓
- [ ] All signers available and ready ✓
- [ ] No outstanding issues ✓

### 6.1 Transfer NavTokenHub Ownership (Base)

```bash
# Transfer NavTokenHub ownership to SAFE
cast send $NAVTOKEN_HUB \
  "transferOwnership(address)" \
  $SAFE_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_MAINNET_RPC
```

- [ ] Transfer transaction sent
- [ ] Transaction hash: _________________
- [ ] Transaction confirmed ✓

Verify new owner:
```bash
cast call $NAVTOKEN_HUB "owner()" --rpc-url $BASE_MAINNET_RPC
```

Expected output: `$SAFE_ADDRESS`

- [ ] Owner is now SAFE ✓
- [ ] **Deployer no longer has control over NavTokenHub** ✓

### 6.2 Transfer NavTokenAdapter Ownership (Berachain)

```bash
# Transfer NavTokenAdapter ownership to SAFE
cast send $NAVTOKEN_ADAPTER \
  "transferOwnership(address)" \
  $SAFE_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BERACHAIN_MAINNET_RPC
```

- [ ] Transfer transaction sent
- [ ] Transaction hash: _________________
- [ ] Transaction confirmed ✓

Verify new owner:
```bash
cast call $NAVTOKEN_ADAPTER "owner()" --rpc-url $BERACHAIN_MAINNET_RPC
```

Expected output: `$SAFE_ADDRESS`

- [ ] Owner is now SAFE ✓
- [ ] **Deployer no longer has control over NavTokenAdapter** ✓

### 6.3 Verify SAFE Control

Test that SAFE can manage contracts:

#### Test 1: Set Delegate on Base (from SAFE)

Using SAFE UI on Base:
1. Load SAFE and connect to Base Mainnet
2. Navigate to Transaction Builder
3. Call `NavTokenHub.setDelegate(address)` with a new delegate address
4. Sign with required signers
5. Execute

- [ ] Transaction created in SAFE ✓
- [ ] All signers signed ✓
- [ ] Transaction executed ✓
- [ ] Transaction hash: _________________
- [ ] **CONFIRMED:** SAFE has operational control on Base ✓

#### Test 2: Set Delegate on Berachain (from SAFE)

Using SAFE UI on Berachain:
1. Load SAFE and connect to Berachain Mainnet
2. Navigate to Transaction Builder
3. Call `NavTokenAdapter.setDelegate(address)` with a new delegate address
4. Sign with required signers
5. Execute

- [ ] Transaction created in SAFE ✓
- [ ] All signers signed ✓
- [ ] Transaction executed ✓
- [ ] Transaction hash: _________________
- [ ] **CONFIRMED:** SAFE has operational control on Berachain ✓

### 6.4 Test Bridge Still Works After Ownership Transfer

Send 1 NAV Base → Berachain to confirm:

```bash
pnpm hardhat lz:oft:send \
  --network base-mainnet \
  --src-eid 30184 \
  --dst-eid 30290 \
  --amount 1000000000000000000 \
  --to <test-address>
```

- [ ] Transaction sent ✓
- [ ] Message delivered ✓
- [ ] Tokens received ✓
- [ ] **Bridge still functional after ownership transfer** ✓

### 6.5 Return Funds to SAFE

Return remaining gas funds to SAFE:

#### Base ETH Return

```bash
# Check deployer balance
cast balance <deployer-address> --rpc-url $BASE_MAINNET_RPC

# Send remaining ETH to SAFE (leave some for gas)
cast send $SAFE_ADDRESS \
  --value <remaining-amount-minus-gas> \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_MAINNET_RPC
```

- [ ] ETH returned to SAFE
- [ ] Transaction hash: _________________
- [ ] Final deployer balance (Base): _________ ETH ✓

#### Berachain BERA Return

```bash
# Check deployer balance
cast balance <deployer-address> --rpc-url $BERACHAIN_MAINNET_RPC

# Send remaining BERA to SAFE (leave some for gas)
cast send $SAFE_ADDRESS \
  --value <remaining-amount-minus-gas> \
  --private-key $PRIVATE_KEY \
  --rpc-url $BERACHAIN_MAINNET_RPC
```

- [ ] BERA returned to SAFE
- [ ] Transaction hash: _________________
- [ ] Final deployer balance (Berachain): _________ BERA ✓

### 6.6 Secure Deployer Wallet

**⚠️ SECURITY:** The deployer private key is no longer needed but still has access to any remaining funds.

- [ ] All funds returned to SAFE ✓
- [ ] Deployer balance minimal (< $1 value) ✓
- [ ] `.env.mainnet` backed up securely (encrypted)
- [ ] `.env.mainnet` removed from local machine
- [ ] Private key stored in secure vault (if needed for records)
- [ ] **Deployer wallet secured** ✓

---

## PHASE 7: Final Verification & Documentation

### 7.1 Security Checklist

- [ ] NavTokenHub owner = SAFE (Base) ✓
- [ ] NavTokenAdapter owner = SAFE (Berachain) ✓
- [ ] Deployer wallet has no control ✓
- [ ] Peers configured correctly on both chains ✓
- [ ] 3 DVNs active (Canary, Deutsche Telekom, Nansen) ✓
- [ ] Enforced options set correctly ✓
- [ ] No public mint functions accessible ✓
- [ ] Bridge tested and working ✓
- [ ] SAFE has operational control ✓
- [ ] All funds returned to SAFE ✓

### 7.2 Contract Verification on Block Explorers

#### Verify NavTokenHub on BaseScan

Go to: https://basescan.org/address/`<navtokenhub-address>`

- [ ] Contract visible on BaseScan ✓
- [ ] Verify source code (optional but recommended)
  - Upload sources via Hardhat: `pnpm hardhat verify --network base-mainnet <address>`
- [ ] Contract marked as verified ✓

#### Verify NavTokenAdapter on Berachain Explorer

Go to: https://explorer.berachain.com/address/`<navtokenadapter-address>`

- [ ] Contract visible on explorer ✓
- [ ] Verify source code (optional but recommended)
  - Upload sources via Hardhat: `pnpm hardhat verify --network berachain-mainnet <address>`
- [ ] Contract marked as verified ✓

### 7.3 Create Final Deployment Record

Save this information permanently:

```markdown
# NAV LayerZero Bridge - Mainnet Deployment

**Deployment Date:** <date>
**Deployed By:** <deployer-name>
**Deployer Address:** <deployer-address>
**SAFE Address:** $SAFE_ADDRESS

## Contract Addresses

| Contract | Network | Address | Block Explorer |
|----------|---------|---------|----------------|
| NavTokenHub | Base Mainnet | _________ | [BaseScan](https://basescan.org/address/_________) |
| NavTokenAdapter | Berachain Mainnet | _________ | [Berachain Explorer](https://explorer.berachain.com/address/_________) |
| NAV Token | Berachain Mainnet | 0x6536cEAD649249cae42FC9bfb1F999429b3ec755 | [Explorer](https://explorer.berachain.com/address/0x6536cEAD649249cae42FC9bfb1F999429b3ec755) |

## Configuration

### Network Endpoints
- Base Mainnet EID: 30184
- Berachain Mainnet EID: 30290

### Security Stack
- **DVNs:** Canary, Deutsche Telekom, Nansen (3 required)
- **Confirmations:**
  - Base → Berachain: 10 blocks
  - Berachain → Base: 20 blocks
- **Enforced Gas:** _________ (profiled value)

### Ownership
- Both contracts owned by SAFE: `$SAFE_ADDRESS`
- SAFE threshold: _______ / _______
- SAFE signers:
  1. _________________
  2. _________________
  3. _________________

## Test Results

### Test 1: Base → Berachain
- Amount: 10 NAV
- Tx Hash: _________________
- Time: _______ minutes
- Status: ✓ Success

### Test 2: Berachain → Base
- Amount: 5 NAV
- Tx Hash: _________________
- Time: _______ minutes
- Status: ✓ Success

### Performance
- Average delivery time (Base → Berachain): _______ min
- Average delivery time (Berachain → Base): _______ min
- Average DVN verification time: _______ min
- Average gas cost (Base): _______ ETH
- Average gas cost (Berachain): _______ BERA
- Estimated DVN fees: $_______ per message

## Monitoring

- LayerZero Scan: https://layerzeroscan.com/
- Base NavTokenHub: https://layerzeroscan.com/address/30184/_________
- Berachain NavTokenAdapter: https://layerzeroscan.com/address/30290/_________

## Emergency Contacts

- On-call: _________________
- SAFE Signers: See above
- LayerZero Support: [Discord](https://discord.gg/layerzero)

---

**Deployment Status:** ✅ COMPLETED
**Date Completed:** __________
**Reviewed By:** __________
```

- [ ] Deployment record created ✓
- [ ] Saved to secure location ✓
- [ ] Shared with team ✓

### 7.4 Setup Monitoring

#### LayerZero Scan Watchlist

1. Go to https://layerzeroscan.com/
2. Search for NavTokenHub address
3. Click "Add to Watchlist"
4. Repeat for NavTokenAdapter

- [ ] NavTokenHub added to watchlist ✓
- [ ] NavTokenAdapter added to watchlist ✓
- [ ] Notifications enabled ✓

#### Monitoring Checklist

- [ ] LayerZero Scan watchlist configured ✓
- [ ] Alert system for failed messages (optional) ✓
- [ ] Gas price monitoring (optional) ✓
- [ ] Bridge volume tracking (optional) ✓
- [ ] On-call rotation defined ✓
- [ ] Escalation procedures documented ✓

### 7.5 Post-Deployment Actions

- [ ] Announce bridge deployment (if public)
- [ ] Update documentation/website with contract addresses
- [ ] Train support team on bridge operations
- [ ] Create user guide for bridge usage
- [ ] Set up analytics dashboard (optional)
- [ ] Schedule security audit (recommended)
- [ ] Plan for future upgrades (if needed)

---

## 🎉 DEPLOYMENT COMPLETE!

**Congratulations!** Your NAV LayerZero bridge is now live on mainnet.

### Final Checklist

- [ ] All phases completed ✓
- [ ] All tests passed ✓
- [ ] Ownership transferred to SAFE ✓
- [ ] Documentation complete ✓
- [ ] Monitoring active ✓
- [ ] Team trained ✓

### Next Steps

1. **Monitor bridge activity** for first 24-48 hours
2. **Be ready to respond** to any issues (SAFE signers available)
3. **Track performance** and optimize if needed
4. **Gather user feedback** and iterate
5. **Consider security audit** if not already done

---

## Troubleshooting

### Issue: Message Stuck/Failed on LayerZero Scan

**Symptoms:** Message shows as "payable" or "blocked" on LayerZero Scan

**Solutions:**
1. Check if previous message in channel failed (messages are ordered)
2. Use LayerZero's recovery tools: https://docs.layerzero.network/v2/developers/evm/troubleshooting/debugging-messages
3. Contact LayerZero support via Discord

**From SAFE:**
- Can call `lzReceive` manually if needed
- Can skip failed messages (WARNING: permanent!)

### Issue: DVN Not Verifying

**Symptoms:** Message stuck waiting for DVN verification

**Solutions:**
1. Check DVN status on LayerZero Scan
2. Wait longer (DVNs may be slow during high activity)
3. Contact specific DVN if > 1 hour delay

### Issue: High Gas Fees

**Symptoms:** Bridge usage expensive

**Solutions:**
1. Re-profile gas and lower enforced options (from SAFE)
2. Increase confirmations to reduce DVN costs
3. Consider reducing number of required DVNs (from SAFE)

### Issue: SAFE Transaction Fails

**Symptoms:** Transaction created in SAFE but fails when executed

**Solutions:**
1. Check gas limit in SAFE transaction
2. Simulate transaction before executing
3. Verify signer permissions and threshold
4. Check contract state (paused, etc.)

---

## Emergency Procedures

### Emergency Contact Tree

1. **First Responder:** _________________
   - Phone: _________________
   - Telegram: _________________

2. **Backup:** _________________
   - Phone: _________________
   - Telegram: _________________

3. **SAFE Signers:** (All must be reachable)
   - Signer 1: _________________
   - Signer 2: _________________
   - Signer 3: _________________

### Emergency Scenarios

#### Scenario 1: Bridge Exploit Detected

**Actions:**
1. [ ] Alert all SAFE signers immediately
2. [ ] Assess scope of exploit
3. [ ] If possible, pause contracts (if pause function exists)
4. [ ] Contact LayerZero team
5. [ ] Document all affected transactions
6. [ ] Coordinate with security firm

#### Scenario 2: Large Value Transfer Stuck

**Actions:**
1. [ ] Identify message on LayerZero Scan
2. [ ] Check DVN verification status
3. [ ] Contact LayerZero support if > 1 hour
4. [ ] Update user/stakeholders
5. [ ] Consider manual execution if needed

#### Scenario 3: SAFE Signer Unavailable

**Actions:**
1. [ ] Verify threshold can still be met
2. [ ] Contact backup signers
3. [ ] If threshold at risk, consider emergency key recovery
4. [ ] Document incident for post-mortem

---

## Appendix

### A. Useful Commands

```bash
# Check contract owner
cast call <address> "owner()" --rpc-url <rpc>

# Check peer
cast call <address> "peers(uint32)" <eid> --rpc-url <rpc>

# Check balance
cast call <token> "balanceOf(address)" <address> --rpc-url <rpc>

# Estimate gas for transaction
cast estimate <address> <signature> <args> --rpc-url <rpc>

# Check transaction status
cast tx <tx-hash> --rpc-url <rpc>

# Get latest block
cast block latest --rpc-url <rpc>
```

### B. Important Links

- **LayerZero Docs:** https://docs.layerzero.network/v2
- **LayerZero Scan:** https://layerzeroscan.com/
- **LayerZero Discord:** https://discord.gg/layerzero
- **BaseScan:** https://basescan.org/
- **Berachain Explorer:** https://explorer.berachain.com/
- **SAFE UI:** https://app.safe.global/

### C. Endpoint IDs Reference

| Network | Testnet EID | Mainnet EID |
|---------|-------------|-------------|
| Base | 40245 | 30184 |
| Berachain | 40291 | 30290 |

### D. Gas Estimates

| Operation | Base Gas | Berachain Gas |
|-----------|----------|---------------|
| Deploy NavTokenHub | ~1,500,000 | N/A |
| Deploy NavTokenAdapter | N/A | ~1,200,000 |
| setPeer | ~50,000 | ~50,000 |
| setConfig | ~100,000 | ~100,000 |
| send (cross-chain) | ~200,000 + DVN fees | ~200,000 + DVN fees |

---

**Version:** 1.0
**Last Updated:** <date>
**Maintained By:** <team-name>
