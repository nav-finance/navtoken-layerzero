# NAV LayerZero Bridge - Mainnet Deployment Guide

**Date:** 15/10/2025
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

**Security Checklist:**
- [x] Deployer wallet created with encrypted keystore ✓
- [x] Keystore password stored securely (NOT in files)
- [x] `.env.mainnet` contains ONLY RPC URLs (no private key) ✓
- [x] `.env.mainnet` added to `.gitignore`
- [x] **VERIFIED:** `.env.mainnet` NOT tracked by git
- [x] Deployer address recorded: `0x18bD8e16bc7D7324432a1bdCa3Ee535694f76E0A` ✓

---

## PHASE 2: Verify SAFE Control & Fund Deployer

**Goal:** Verify SAFE multisig control on both chains AND fund deployer wallet in one transaction per chain.

### 2.1 Verify Base SAFE & Fund Deployer

**Base SAFE Address:** `0x735698e050da63a3ce02488b6cd6714b8e459a09`

**Expected SAFE Configuration:**
- [x] SAFE exists on Base Mainnet ✓
- [x] Number of owners: 3
- [x] Threshold: 2 (signatures required)
- [x] Current signers:
  - [x] 0xcac4617a0aa4c57245fe2fb15e78bc21c2e535c1
  - [x] 0xf13f7bf69a5e57ea3367222c65dd3380096d3fbf
  - [x] 0x735698e050da63a3ce02488b6cd6714b8e459a09
- [x] All signers have access to their keys ✓

---

### 2.2 Verify Berachain SAFE & Fund Deployer

**Berachain SAFE Address:** `0x8F9Ae98d1670ECb6407FE7B2EA993C0AD7ac80e1`

**Expected SAFE Configuration:**
- [x] SAFE exists on Berachain Mainnet ✓
- [x] Number of owners: 3 (matches Base SAFE)
- [x] Threshold: 2 (matches Base SAFE)
- [x] Signers match Base SAFE ✓
- [x] Nonce: 31 (has transaction history) ✓

---

## PHASE 3: Contract Deployment

### 3.1 Deploy NavTokenHub on Base Mainnet

```bash
# Deploy NavTokenHub (assumes environment is set up from section above)
pnpm hardhat lz:deploy \
  --network base-mainnet \
  --tags NavTokenHub
```

- [x] Deployment transaction sent
- [x] Transaction hash: 0x43db8354ef963875aadf9edeb55016754f9252e2b8722532f49bc798fdad14b0
- [x] **NavTokenHub Address:** 0xA15D5c95b7c0EeCAC06F673Ad390ad6066705Af7
- [x] Deployment successful ✓

**Verification:**
- [x] Owner: 0x18bD8e16bc7D7324432a1bdCa3Ee535694f76E0A ✓
- [x] Endpoint: 0x1a44076050125825900e736c501f859c50fe728c (LayerZero EndpointV2)
- [x] Name: "NAV Token" ✓
- [x] Symbol: "NAV" ✓
- [x] Decimals: 18 ✓
- [x] **Verify on BaseScan:** https://basescan.org/address/0xa15d5c95b7c0eecac06f673ad390ad6066705af7
- [x] Contract shows on block explorer ✓

### 3.2 Deploy NavTokenAdapter on Berachain Mainnet

```bash
# Deploy NavTokenAdapter (assumes environment is set up)
pnpm hardhat lz:deploy \
  --network berachain-mainnet \
  --tags NavTokenAdapter
```

- [x] Deployment transaction sent
- [x] Transaction hash: 0x633adc709d43890a7cb6830d9f9a08048487c493cd6dcbeede22ab59b6546458
- [x] **NavTokenAdapter Address:** 0xA15D5c95b7c0EeCAC06F673Ad390ad6066705Af7
- [x] Deployment successful ✓

#### Verify NavTokenAdapter Deployment

- [x] Owner: 0x18bD8e16bc7D7324432a1bdCa3Ee535694f76E0A ✓
- [x] Endpoint: 0x6f475642a6e85809b1c36fa62763669b1b48dd5b (LayerZero EndpointV2)
- [x] **CRITICAL - Wrapped Token:** `0x6536cEAD649249cae42FC9bfb1F999429b3ec755` ✓
- [x] **CONFIRMED:** Adapter is wrapping the CORRECT NAV token ✓
- [x] **Verify on Berachain Explorer:** https://explorer.berachain.com/address/0xA15D5c95b7c0EeCAC06F673Ad390ad6066705Af7
- [x] Contract shows on block explorer ✓

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

- [x] All wiring transactions completed ✓
- [x] No transaction reverted ✓

### 4.2 Verify Configuration

```bash
# View applied configuration
pnpm hardhat lz:oapp:config:get \
  --oapp-config mainnet.layerzero.config.ts
```

- [x] Configuration verified ✓
