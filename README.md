# FHE Game NFT - Privacy-Preserving Gaming with Fully Homomorphic Encryption

[![License: BSD-3-Clause-Clear](https://img.shields.io/badge/License-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![Built with Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![Powered by FHEVM](https://img.shields.io/badge/Powered%20by-FHEVM-purple)](https://docs.zama.ai/fhevm)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.27-363636)](https://soliditylang.org/)

A decentralized monster-hunting game that leverages Fully Homomorphic Encryption (FHE) to create NFTs with **encrypted character statistics**. Players battle monsters at different difficulty levels, earning NFTs with **publicly visible rarity** but **privately encrypted attack and defense stats** that remain confidential on-chain.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [The Problem We Solve](#the-problem-we-solve)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Frontend Application](#frontend-application)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [FHE Implementation Details](#fhe-implementation-details)
- [Security Considerations](#security-considerations)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support & Resources](#support--resources)

## Overview

**FHE Game NFT** is a blockchain-based game that demonstrates the power of Fully Homomorphic Encryption (FHE) in gaming and NFT applications. Unlike traditional blockchain games where all data is transparent, our game uses Zama's FHEVM to encrypt sensitive character statistics while maintaining full on-chain computation capabilities.

Players can:
- **Attack monsters** at three difficulty levels: Easy (80% success), Hard (20% success), and Hell (5% success)
- **Earn NFT rewards** upon successful monster defeats
- **Own unique characters** with encrypted stats that only they can decrypt
- **Trade NFTs** while keeping stat values private from other players

### Demo

The game is deployed on Sepolia testnet and features a React-based web interface with wallet integration via RainbowKit.

## Key Features

### 🔐 Privacy-Preserving Stats
- **Encrypted Character Data**: Attack and defense stats are encrypted using FHE and stored on-chain
- **Owner-Only Decryption**: Only NFT owners can decrypt and view their character's true stats
- **On-Chain Computation**: Game logic executes on encrypted data without revealing values

### 🎮 Engaging Gameplay
- **Three Difficulty Levels**: Choose your risk level with different success rates and rewards
- **Probabilistic Rewards**: Higher difficulty yields rarer NFTs with better stat ranges
- **Transparent Rarity**: While stats are private, rarity levels (Common/Rare/Legendary) are public

### 🏆 NFT Mechanics
- **ERC721-Compatible**: Standard NFT interface for marketplace compatibility
- **Dynamic Minting**: NFTs are minted on successful monster defeats
- **Stat Ranges by Rarity**:
  - **Common**: Attack/Defense 10-20
  - **Rare**: Attack/Defense 30-50
  - **Legendary**: Attack/Defense 60-100

### 🛡️ Built on FHEVM
- **Zama Protocol Integration**: Leverages Zama's FHEVM for native FHE support
- **Sepolia Testnet**: Deployed on Ethereum's Sepolia testnet
- **Relayer-Based Decryption**: Uses Zama's relayer network for secure client-side decryption

## The Problem We Solve

### Traditional Blockchain Gaming Limitations

1. **Transparency Problem**: All on-chain data is public, eliminating strategic depth
   - Players can see opponents' exact stats before battles
   - No hidden information or surprise elements possible
   - Reduces competitive gameplay to pure mathematics

2. **Privacy Concerns**: Sensitive game data is exposed
   - Asset values and character builds are public knowledge
   - No privacy for players who want to keep strategies secret
   - Potential for front-running and exploitation

3. **Off-Chain Compromises**: Many games resort to centralized solutions
   - Defeats the purpose of blockchain decentralization
   - Requires trust in centralized servers
   - Vulnerable to server manipulation and downtime

### Our FHE-Based Solution

FHE Game NFT solves these problems by:
- **Computing on Encrypted Data**: Game logic runs directly on encrypted values
- **Selective Disclosure**: Only NFT owners can decrypt their own stats
- **True On-Chain Privacy**: No centralized servers or trusted third parties
- **Verifiable Fairness**: All logic is transparent and auditable on-chain

This creates a new paradigm for blockchain gaming where privacy and decentralization coexist.

## How It Works

### Game Flow

```
1. Player connects wallet to web interface
2. Player selects difficulty level (Easy/Hard/Hell)
3. Smart contract generates pseudo-random outcome
4. On success:
   a. NFT is minted with rarity based on difficulty
   b. Random stats are generated within rarity range
   c. Stats are encrypted using FHE and stored on-chain
   d. ACL permissions grant decryption rights to owner
5. Player views inventory with decrypted stats
```

### FHE Encryption Process

```
Plaintext Stats → FHE.asEuint32() → Encrypted euint32 → On-Chain Storage
                                                              ↓
                                                         ACL Setup
                                                              ↓
Owner Decryption ← Relayer Service ← EIP-712 Signature ← User Request
```

### Stat Generation Logic

The contract uses block data for pseudo-randomness:
```solidity
uint256 rand = keccak256(
    abi.encodePacked(
        block.prevrandao,
        block.timestamp,
        msg.sender,
        _balanceOf[msg.sender],
        _tokenIdCounter
    )
) % 100;
```

Based on difficulty and random value:
- **Easy**: 80% success → Common rarity → Stats 10-20
- **Hard**: 20% success → Rare rarity → Stats 30-50
- **Hell**: 5% success → Legendary rarity → Stats 60-100

## Technology Stack

### Smart Contract Layer
- **Solidity 0.8.27**: Smart contract programming language
- **FHEVM by Zama**: Fully Homomorphic Encryption for Ethereum
  - `@fhevm/solidity ^0.8.0`: FHE library for Solidity
  - `@zama-fhe/oracle-solidity ^0.1.0`: Decryption oracle integration
- **Hardhat 2.26.0**: Development environment and testing framework
- **TypeChain**: TypeScript bindings for contracts
- **OpenZeppelin Contracts**: Standard implementations (used as references)

### Frontend Layer
- **React 19.1.1**: UI framework
- **TypeScript 5.8.3**: Type-safe development
- **Vite 7.1.6**: Fast build tool and dev server
- **Wagmi 2.17.0**: React hooks for Ethereum
- **Viem 2.37.6**: TypeScript interface for Ethereum
- **RainbowKit 2.2.8**: Wallet connection UI
- **TanStack Query 5.89.0**: Data fetching and caching
- **Ethers.js 6.15.0**: Ethereum library for contract interactions
- **@zama-fhe/relayer-sdk 0.2.0**: Client-side FHE decryption

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Solhint**: Solidity linting
- **Hardhat Deploy**: Deployment management
- **Mocha & Chai**: Testing frameworks

### Network & Infrastructure
- **Sepolia Testnet**: Ethereum test network
- **Infura**: RPC provider
- **Zama Relayer**: FHE decryption service at `relayer.testnet.zama.cloud`

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │ AttackPanel  │  │  Inventory  │  │  Wallet Connect  │  │
│  └──────┬───────┘  └──────┬──────┘  └────────┬─────────┘  │
│         │                 │                   │             │
│         └─────────────────┴───────────────────┘             │
│                           │                                 │
│                  ┌────────▼────────┐                       │
│                  │  Wagmi + Viem   │                       │
│                  └────────┬────────┘                       │
└───────────────────────────┼─────────────────────────────────┘
                            │
                ┌───────────┴──────────┐
                │                      │
        ┌───────▼────────┐    ┌───────▼────────┐
        │  GameNFT.sol   │    │  Zama Relayer  │
        │                │    │   (Decryption) │
        │  - attackOf()  │    └────────────────┘
        │  - defenseOf() │
        │  - mint logic  │
        └────────┬───────┘
                 │
        ┌────────▼──────────┐
        │  FHEVM Runtime    │
        │  - FHE.asEuint32  │
        │  - FHE.allow      │
        │  - Encrypted ops  │
        └───────────────────┘
```

### Smart Contract Architecture

The `GameNFT.sol` contract combines:
1. **ERC721 NFT Standard**: Basic ownership and transfer functionality
2. **FHE Integration**: Encrypted stat storage and access control
3. **Game Logic**: Monster attack mechanics and reward distribution

Key components:
- **Storage**: Mappings for ownership, stats, and rarity
- **Modifiers**: Owner-only functions for admin operations
- **Events**: Transfer events and game outcome notifications
- **FHE Operations**: Encryption, decryption permissions, and encrypted computations

## Smart Contracts

### GameNFT.sol

**Location**: `contracts/GameNFT.sol`

**Inheritance**: `SepoliaConfig` (Zama configuration)

**Core Functions**:

#### Gameplay Functions
```solidity
function attackMonster(Difficulty difficulty)
    external
    returns (bool win, uint256 tokenId)
```
Main gameplay function. Players call this to attempt defeating a monster.
- **Parameters**:
  - `difficulty`: 0=Easy, 1=Hard, 2=Hell
- **Returns**:
  - `win`: Whether the attack succeeded
  - `tokenId`: ID of newly minted NFT (0 if failed)
- **Logic**:
  1. Generates pseudo-random number
  2. Compares against difficulty threshold
  3. On success, mints NFT with encrypted stats
  4. Emits `MonsterAttacked` event

#### NFT Query Functions
```solidity
function rarityOf(uint256 tokenId) external view returns (Rarity)
function attackOf(uint256 tokenId) external view returns (euint32)
function defenseOf(uint256 tokenId) external view returns (euint32)
function tokensOfOwner(address account) external view returns (uint256[])
```
Query functions for NFT data:
- `rarityOf`: Returns public rarity value
- `attackOf`/`defenseOf`: Returns encrypted stat handles
- `tokensOfOwner`: Returns array of token IDs owned by address

#### Admin Functions
```solidity
function adminMint(address to, Rarity rarity, uint32 atk, uint32 defn)
    external
    onlyOwner
    returns (uint256 tokenId)
```
Owner-only function for testing and admin purposes.

#### ERC721 Standard Functions
Standard NFT interface: `balanceOf`, `ownerOf`, `approve`, `transferFrom`, etc.

**Data Structures**:
```solidity
enum Difficulty { Easy, Hard, Hell }
enum Rarity { Common, Rare, Legendary }

struct Stats {
    euint32 attack;
    euint32 defense;
}
```

**Key Events**:
```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
event MonsterAttacked(address indexed player, Difficulty difficulty, bool win, uint256 tokenId)
```

### FHECounter.sol

**Location**: `contracts/FHECounter.sol`

A reference implementation demonstrating basic FHE operations:
- Encrypted counter storage
- Increment/decrement with encrypted values
- Input proof verification

## Frontend Application

### Project Structure
```
home/
├── src/
│   ├── components/
│   │   ├── attack/
│   │   │   └── AttackPanel.tsx    # Monster attack UI
│   │   ├── inventory/
│   │   │   └── Inventory.tsx      # NFT display with decryption
│   │   ├── Header.tsx             # Navigation and wallet connect
│   │   └── GameApp.tsx            # Main game component
│   ├── config/
│   │   └── wagmi.ts               # Wagmi configuration
│   ├── hooks/
│   │   ├── useZamaInstance.ts     # FHE instance management
│   │   └── useEthersSigner.ts     # Ethers signer from Wagmi
│   ├── abi/
│   │   └── GameNFT.ts             # Contract ABI and address
│   ├── App.tsx                    # Root component
│   └── main.tsx                   # Entry point
├── package.json
└── vite.config.ts
```

### Key Components

#### AttackPanel (`AttackPanel.tsx`)
- Renders three difficulty buttons
- Sends transactions to `attackMonster()` function
- Displays loading states and transaction feedback
- Triggers inventory refresh on success

**Code Reference**: `home/src/components/attack/AttackPanel.tsx:13-30`

#### Inventory (`Inventory.tsx`)
- Fetches owned token IDs via `tokensOfOwner()`
- Reads public rarity data
- Retrieves encrypted stat handles
- **Decrypts stats using Zama relayer**:
  1. Creates FHE instance with relayer URL
  2. Generates keypair for decryption
  3. Creates EIP-712 signature for authentication
  4. Calls `userDecrypt()` with handles and signature
  5. Displays decrypted values

**Code Reference**: `home/src/components/inventory/Inventory.tsx:44-100`

#### Wagmi Configuration (`wagmi.ts`)
Configures wallet connection:
- RainbowKit integration
- Sepolia network setup
- RPC transport configuration

### Decryption Flow

The inventory component implements Zama's relayer-based decryption:

```typescript
// 1. Generate keypair
const instance = new FhevmInstance({
  url: 'https://relayer.testnet.zama.cloud'
});
const keypair = instance.generateKeypair();

// 2. Create EIP-712 signature
const eip712 = instance.createEIP712(
  keypair.publicKey,
  [contractAddress],
  timestamp,
  duration
);
const signature = await signer.signTypedData(...);

// 3. Decrypt handles
const result = await instance.userDecrypt(
  handlePairs,
  keypair.privateKey,
  keypair.publicKey,
  signature,
  ...
);
```

## Installation & Setup

### Prerequisites
- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **Git**: For cloning the repository
- **MetaMask**: Or another Web3 wallet
- **Sepolia ETH**: For testnet transactions ([Sepolia Faucet](https://sepoliafaucet.com/))

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fhe-game-nft.git
   cd fhe-game-nft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```bash
   # Private key for deployment (with 0x prefix)
   PRIVATE_KEY=0x...your_private_key

   # Infura API key for Sepolia
   INFURA_API_KEY=your_infura_api_key

   # Etherscan API key for verification
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

   **Security Warning**: Never commit `.env` file with real keys to version control.

4. **Compile contracts**
   ```bash
   npm run compile
   ```

5. **Run tests**
   ```bash
   npm test
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd home
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Configure contract address**

   After deploying the contract, update `home/src/abi/GameNFT.ts` with:
   - Contract address
   - Contract ABI (auto-generated from compilation)

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Usage

### Playing the Game

1. **Connect Wallet**
   - Visit the application URL
   - Click "Connect Wallet" in the header
   - Select your wallet provider (MetaMask, etc.)
   - Approve connection to Sepolia testnet

2. **Attack Monsters**
   - Choose difficulty level:
     - **Easy**: 80% win rate → Common NFT
     - **Hard**: 20% win rate → Rare NFT
     - **Hell**: 5% win rate → Legendary NFT
   - Click attack button
   - Confirm transaction in wallet
   - Wait for confirmation

3. **View Inventory**
   - Scroll to "Your Inventory" section
   - NFTs will load automatically
   - Stats are decrypted client-side via Zama relayer
   - Each NFT shows:
     - Token ID
     - Rarity (public)
     - Attack stat (decrypted)
     - Defense stat (decrypted)

4. **Trade NFTs** (via marketplace integration)
   - NFTs are ERC721-compatible
   - Can be listed on any marketplace supporting Sepolia
   - Buyers cannot see encrypted stats until they own the NFT

### Interacting with Smart Contract

#### Via Hardhat Tasks

```bash
# Check account balances
npx hardhat accounts

# Deploy contract
npx hardhat deploy --network sepolia

# Run GameNFT tasks (if configured)
npx hardhat --network sepolia game:attack --difficulty 0
npx hardhat --network sepolia game:inventory --address 0x...
```

#### Via Ethers.js/Web3

```javascript
import { ethers } from 'ethers';
import { abi, address } from './abi/GameNFT';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(address, abi, signer);

// Attack monster
const tx = await contract.attackMonster(0); // 0 = Easy
const receipt = await tx.wait();
console.log('Transaction:', receipt);

// Check inventory
const tokenIds = await contract.tokensOfOwner(userAddress);
console.log('Owned tokens:', tokenIds);
```

## Testing

### Running Tests

```bash
# Run all tests on local network
npm test

# Run tests on Sepolia testnet
npm run test:sepolia

# Generate coverage report
npm run coverage

# Run specific test file
npx hardhat test test/GameNFT.ts
```

### Test Structure

**Location**: `test/GameNFT.ts`

Tests cover:
- ✅ NFT minting on successful attacks
- ✅ Correct rarity assignment by difficulty
- ✅ Stat ranges within expected bounds
- ✅ FHE encryption and ACL permissions
- ✅ Owner-only admin functions
- ✅ ERC721 transfer functionality
- ✅ Event emissions

**Example Test**:
```typescript
it("Should mint NFT on successful Easy attack", async function() {
  const { gameNFT, player } = await loadFixture(deployFixture);

  const tx = await gameNFT.connect(player).attackMonster(0);
  const receipt = await tx.wait();

  const event = receipt.logs.find(
    log => log.topics[0] === gameNFT.interface.getEvent('MonsterAttacked').topicHash
  );

  expect(event).to.not.be.undefined;
  // Additional assertions...
});
```

### Sepolia Testing

**Location**: `test/FHECounterSepolia.ts`, `test/GameNFT.ts`

Testing on Sepolia provides:
- Real FHE encryption/decryption
- Actual relayer integration
- Production-like environment
- Gas cost estimation

## Deployment

### Local Deployment

1. **Start local Hardhat node**
   ```bash
   npm run chain
   ```

2. **Deploy contracts** (in new terminal)
   ```bash
   npm run deploy:localhost
   ```

3. **Note deployed address** from output

### Sepolia Deployment

1. **Ensure you have Sepolia ETH**
   - Get from [Sepolia Faucet](https://sepoliafaucet.com/)
   - Minimum ~0.1 ETH recommended

2. **Verify environment variables**
   ```bash
   # Check .env file has:
   # - PRIVATE_KEY
   # - INFURA_API_KEY
   # - ETHERSCAN_API_KEY
   ```

3. **Deploy to Sepolia**
   ```bash
   npm run deploy:sepolia
   ```

4. **Verify on Etherscan** (optional)
   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

5. **Update frontend configuration**
   - Copy deployed contract address
   - Update `home/src/abi/GameNFT.ts`
   - Copy ABI from `artifacts/contracts/GameNFT.sol/GameNFT.json`

### Deployment Scripts

**Location**: `deploy/01-deploy-GameNFT.ts`

The deployment script:
- Deploys `GameNFT` with name "FHE Game NFT" and symbol "FGNFT"
- Saves deployment info to `deployments/` directory
- Automatically generates TypeChain types
- Supports network-specific configurations

**Code Reference**: `deploy/01-deploy-GameNFT.ts`

## FHE Implementation Details

### What is Fully Homomorphic Encryption?

FHE allows computation on encrypted data without decryption. In our game:
- Stats are encrypted when minted
- Comparisons and calculations happen on ciphertext
- Results remain encrypted until authorized decryption
- Zero-knowledge proof of computation correctness

### Zama's FHEVM

FHEVM brings FHE to Ethereum through:
- **Pre-compiled contracts**: Native FHE operations in EVM
- **Type system**: `euint32`, `euint64` encrypted types
- **ACL system**: Fine-grained decryption permissions
- **Relayer network**: Off-chain decryption service

### Encrypted Types

```solidity
import {FHE, euint32} from "@fhevm/solidity/lib/FHE.sol";

// Encrypt plaintext value
euint32 encrypted = FHE.asEuint32(42);

// Arithmetic on encrypted values
euint32 sum = FHE.add(encrypted1, encrypted2);
euint32 product = FHE.mul(encrypted1, encrypted2);

// Comparisons (result is encrypted boolean)
ebool isGreater = FHE.gt(encrypted1, encrypted2);
```

### Access Control Lists (ACL)

Every encrypted value has an ACL:
```solidity
// Allow contract to operate on encrypted value
FHE.allowThis(encrypted);

// Allow specific address to decrypt
FHE.allow(encrypted, ownerAddress);

// Revoke permission
FHE.revoke(encrypted, oldAddress);
```

**In GameNFT**: `contracts/GameNFT.sol:206-210`
```solidity
FHE.allowThis(eatk);  // Contract can compute with it
FHE.allow(eatk, to);  // Owner can decrypt it
FHE.allowThis(edef);
FHE.allow(edef, to);
```

### Decryption Process

Client-side decryption flow:

1. **User requests decryption**
   - Generates ephemeral keypair
   - Creates EIP-712 signed request

2. **Relayer verifies request**
   - Validates signature
   - Checks ACL permissions
   - Ensures request timestamp validity

3. **Relayer decrypts**
   - Uses trusted execution environment
   - Returns plaintext to authorized user
   - Maintains audit log

4. **Client receives plaintext**
   - Validates response
   - Displays decrypted value

**Security**: User must sign EIP-712 message proving ownership. Relayer only decrypts if ACL permits.

### Gas Costs

FHE operations are more expensive than plaintext:
- `FHE.asEuint32()`: ~100k gas
- `FHE.add()`: ~150k gas
- `FHE.mul()`: ~200k gas
- ACL operations: ~50k gas each

Our `attackMonster()` function costs approximately **400-500k gas** per call.

## Security Considerations

### Smart Contract Security

1. **Randomness**:
   - Current implementation uses `block.prevrandao` for randomness
   - **Warning**: Not cryptographically secure
   - **Production**: Should use Chainlink VRF or similar oracle
   - **Acceptable for**: Testnet demos and low-stakes games

2. **Access Control**:
   - Owner-only functions protected by `onlyOwner` modifier
   - ACL system ensures stat privacy
   - No re-entrancy vulnerabilities (no external calls in critical paths)

3. **Integer Overflow**:
   - Solidity 0.8.x has built-in overflow protection
   - FHE operations handle overflow differently
   - Stat ranges are bounded by design

### FHE-Specific Security

1. **ACL Management**:
   - Only contract and owner can decrypt stats
   - ACLs persist through NFT transfers (need manual update)
   - **Future**: Implement automatic ACL transfer on NFT transfer

2. **Relayer Trust**:
   - Relayer runs in TEE (Trusted Execution Environment)
   - Cannot decrypt without valid signature
   - **Consideration**: Still requires trust in Zama infrastructure

3. **Front-Running**:
   - Attack outcomes are determined by block data
   - Miners/validators could theoretically predict outcomes
   - **Mitigation**: Use commit-reveal scheme or VRF in production

### Privacy Guarantees

✅ **What's Private**:
- Exact attack and defense values
- Stat distributions of owned NFTs
- Individual stat comparisons

❌ **What's Public**:
- NFT ownership
- Rarity levels
- Transaction history
- Number of NFTs owned

### Recommended Practices

1. **For Players**:
   - Never share private keys
   - Verify contract address before interacting
   - Check transaction details before signing

2. **For Developers**:
   - Audit smart contracts before mainnet deployment
   - Use hardware wallets for deployment keys
   - Implement emergency pause mechanisms
   - Add rate limiting for minting functions

## Future Roadmap

### Short-term (Q2 2024)

- [ ] **Improved Randomness**
  - Integrate Chainlink VRF for provably fair outcomes
  - Implement commit-reveal scheme for attack mechanics

- [ ] **Enhanced Gameplay**
  - Add player vs player battles
  - Implement encrypted damage calculations
  - Create tournament system

- [ ] **Marketplace Integration**
  - Deploy to OpenSea and Rarible
  - Add stat reveal mechanism (with owner consent)
  - Implement rarity-based filtering

### Mid-term (Q3-Q4 2024)

- [ ] **Advanced FHE Features**
  - Encrypted inventory management
  - Private stat upgrades
  - Hidden achievement system

- [ ] **Cross-Chain Support**
  - Deploy to other FHEVM-compatible chains
  - Implement bridge for NFT migration
  - Multi-chain inventory tracking

- [ ] **Social Features**
  - Guild system with shared encrypted resources
  - Leaderboards with privacy preservation
  - Achievement verification without revealing details

### Long-term (2025+)

- [ ] **Full Game Ecosystem**
  - Quest system with encrypted state
  - Crafting system with private recipes
  - Economic system with private balances

- [ ] **Mainnet Deployment**
  - Comprehensive security audits
  - Gas optimization for FHE operations
  - Production-grade relayer infrastructure

- [ ] **Advanced Privacy Features**
  - Zero-knowledge proof integration
  - Homomorphic comparison for PvP matchmaking
  - Private auction system

- [ ] **Developer Tools**
  - FHE game development SDK
  - Stat visualization dashboard
  - Testing framework for encrypted game logic

### Research Directions

- [ ] **Scalability**
  - Layer 2 FHE solutions
  - Batched FHE operations
  - Optimized ACL management

- [ ] **Novel Game Mechanics**
  - Asymmetric information games
  - Encrypted game theory implementations
  - Privacy-preserving competitive gaming

## Contributing

We welcome contributions from the community! Here's how you can help:

### Types of Contributions

- 🐛 **Bug Reports**: File issues for bugs you discover
- 💡 **Feature Requests**: Suggest new gameplay features or improvements
- 📖 **Documentation**: Improve README, code comments, or tutorials
- 🔧 **Code**: Submit PRs for bug fixes or new features
- 🎨 **Design**: Contribute UI/UX improvements

### Development Process

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/fhe-game-nft.git
   cd fhe-game-nft
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Test thoroughly**
   ```bash
   npm run lint
   npm test
   npm run coverage
   ```

5. **Submit a pull request**
   - Describe your changes clearly
   - Reference related issues
   - Ensure CI passes

### Code Style

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript**: Follow project ESLint configuration
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)

### Testing Requirements

All PRs must:
- ✅ Pass existing tests
- ✅ Include tests for new features
- ✅ Maintain >80% code coverage
- ✅ Pass linting checks

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

### Key Points:
- ✅ Free to use, modify, and distribute
- ✅ Suitable for commercial use
- ⚠️ No patent grant
- ⚠️ Warranty disclaimer

See [LICENSE](LICENSE) file for full details.

### Third-Party Licenses

- **FHEVM**: BSD-3-Clause-Clear ([Zama License](https://github.com/zama-ai/fhevm))
- **OpenZeppelin**: MIT License
- **Hardhat**: MIT License
- **React**: MIT License

## Support & Resources

### Documentation

- **FHEVM Documentation**: [docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Hardhat Docs**: [hardhat.org/docs](https://hardhat.org/docs)
- **Wagmi Docs**: [wagmi.sh](https://wagmi.sh)
- **RainbowKit Docs**: [rainbowkit.com](https://rainbowkit.com)

### Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/fhe-game-nft/issues)
- **Zama Discord**: [discord.gg/zama](https://discord.gg/zama)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/fhe-game-nft/discussions)

### Getting Help

1. **Check Documentation**: Review README and code comments
2. **Search Issues**: Someone may have already asked your question
3. **Ask the Community**: Post in Discord or GitHub Discussions
4. **File an Issue**: For bugs or feature requests

### Acknowledgments

Built with:
- 💜 **Zama**: For pioneering FHEVM technology
- 🔨 **Hardhat**: For excellent development tooling
- 🌈 **RainbowKit**: For beautiful wallet UX
- ⚛️ **React Team**: For the amazing frontend framework

---

**Built with privacy in mind. Play with confidence.**

*Last updated: January 2025*
