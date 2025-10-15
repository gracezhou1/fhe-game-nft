// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Game NFT with encrypted stats
/// @notice Simple ERC721-like NFT where rarity is public and stats are FHE-encrypted
contract GameNFT is SepoliaConfig {
    // Minimal ERC165
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x80ac58cd || interfaceId == 0x01ffc9a7; // ERC721 & ERC165
    }

    string public name;
    string public symbol;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }

    // Basic ERC721 storage
    uint256 private _tokenIdCounter;
    mapping(uint256 => address) private _ownerOf;
    mapping(address => uint256) private _balanceOf;
    mapping(uint256 => address) private _tokenApproval;
    mapping(address => mapping(address => bool)) private _operatorApproval;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address account) external view returns (uint256) {
        require(account != address(0), "Zero address");
        return _balanceOf[account];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address o = _ownerOf[tokenId];
        require(o != address(0), "Nonexistent token");
        return o;
    }

    function approve(address to, uint256 tokenId) external {
        address o = ownerOf(tokenId);
        require(msg.sender == o || _operatorApproval[o][msg.sender], "Not authorized");
        _tokenApproval[tokenId] = to;
        emit Approval(o, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        require(_ownerOf[tokenId] != address(0), "Nonexistent token");
        return _tokenApproval[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApproval[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address account, address operator) external view returns (bool) {
        return _operatorApproval[account][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        address o = ownerOf(tokenId);
        require(o == from, "Not owner");
        require(to != address(0), "Zero to");
        require(
            msg.sender == o || _tokenApproval[tokenId] == msg.sender || _operatorApproval[o][msg.sender],
            "Not approved"
        );
        _transfer(from, to, tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        _tokenApproval[tokenId] = address(0);
        _ownerOf[tokenId] = to;
        _balanceOf[from] -= 1;
        _balanceOf[to] += 1;
        emit Transfer(from, to, tokenId);
    }

    // Game data
    enum Difficulty {
        Easy, // 80%
        Hard, // 20%
        Hell // 5%
    }

    enum Rarity {
        Common,
        Rare,
        Legendary
    }

    struct Stats {
        euint32 attack;
        euint32 defense;
    }

    mapping(uint256 => Rarity) private _rarityOf;
    mapping(uint256 => Stats) private _statsOf;
    mapping(address => uint256[]) private _ownedTokens;

    event MonsterAttacked(address indexed player, Difficulty difficulty, bool win, uint256 tokenId);

    function rarityOf(uint256 tokenId) external view returns (Rarity) {
        require(_ownerOf[tokenId] != address(0), "Nonexistent token");
        return _rarityOf[tokenId];
    }

    // Encrypted getters (do not use msg.sender in view)
    function attackOf(uint256 tokenId) external view returns (euint32) {
        require(_ownerOf[tokenId] != address(0), "Nonexistent token");
        return _statsOf[tokenId].attack;
    }

    function defenseOf(uint256 tokenId) external view returns (euint32) {
        require(_ownerOf[tokenId] != address(0), "Nonexistent token");
        return _statsOf[tokenId].defense;
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function tokensOfOwner(address account) external view returns (uint256[] memory) {
        return _ownedTokens[account];
    }

    // Core gameplay: attack monster and mint on win
    function attackMonster(Difficulty difficulty) external returns (bool win, uint256 tokenId) {
        // Pseudo-random; acceptable for testnet/game demo
        uint256 rand = uint256(
            keccak256(abi.encodePacked(block.prevrandao, block.timestamp, msg.sender, _balanceOf[msg.sender], _tokenIdCounter))
        ) % 100;

        uint256 threshold;
        Rarity rarity;
        if (difficulty == Difficulty.Easy) {
            threshold = 80; // 80%
            rarity = Rarity.Common;
        } else if (difficulty == Difficulty.Hard) {
            threshold = 20; // 20%
            rarity = Rarity.Rare;
        } else {
            threshold = 5; // 5%
            rarity = Rarity.Legendary;
        }

        if (rand < threshold) {
            // Win -> mint NFT with encrypted stats in range per rarity
            uint32 atk;
            uint32 defn;
            if (rarity == Rarity.Common) {
                atk = uint32(10 + (rand % 11)); // 10-20
                defn = uint32(10 + ((rand + 7) % 11));
            } else if (rarity == Rarity.Rare) {
                atk = uint32(30 + (rand % 21)); // 30-50
                defn = uint32(30 + ((rand + 11) % 21));
            } else {
                atk = uint32(60 + (rand % 41)); // 60-100
                defn = uint32(60 + ((rand + 13) % 41));
            }

            tokenId = _mintWithStats(msg.sender, rarity, atk, defn);
            win = true;
        } else {
            win = false;
            tokenId = 0;
        }

        emit MonsterAttacked(msg.sender, difficulty, win, tokenId);
    }

    // Owner-only mint for testing/admin
    function adminMint(address to, Rarity rarity, uint32 atk, uint32 defn) external onlyOwner returns (uint256 tokenId) {
        tokenId = _mintWithStats(to, rarity, atk, defn);
    }

    function _mintWithStats(address to, Rarity rarity, uint32 atk, uint32 defn) internal returns (uint256 tokenId) {
        require(to != address(0), "Zero to");
        tokenId = ++_tokenIdCounter;

        _ownerOf[tokenId] = to;
        _balanceOf[to] += 1;
        _ownedTokens[to].push(tokenId);

        _rarityOf[tokenId] = rarity;

        // Encrypt and set ACLs
        euint32 eatk = FHE.asEuint32(atk);
        euint32 edef = FHE.asEuint32(defn);
        _statsOf[tokenId] = Stats({attack: eatk, defense: edef});

        // Allow contract and owner to operate and decrypt
        FHE.allowThis(eatk);
        FHE.allow(eatk, to);
        FHE.allowThis(edef);
        FHE.allow(edef, to);

        emit Transfer(address(0), to, tokenId);
    }
}

