import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("GameNFT", function () {
  let deployer: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let game: any;
  let addr: string;

  before(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    alice = signers[1];
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This hardhat test suite cannot run on Sepolia Testnet");
      this.skip();
    }

    const factory = await ethers.getContractFactory("GameNFT");
    game = await factory.deploy("FHE Game NFT", "FGEN");
    addr = await game.getAddress();
  });

  it("admin mint sets encrypted stats and rarity", async function () {
    const rarity = 1; // Rare
    const atk = 42;
    const defn = 37;
    const tx = await game.connect(deployer).adminMint(alice.address, rarity, atk, defn);
    await tx.wait();

    const tid = 1n;
    const r = await game.rarityOf(tid);
    expect(Number(r)).to.eq(rarity);

    const eAtk = await game.attackOf(tid);
    const eDef = await game.defenseOf(tid);

    const clearAtk = await fhevm.userDecryptEuint(FhevmType.euint32, eAtk, addr, alice);
    const clearDef = await fhevm.userDecryptEuint(FhevmType.euint32, eDef, addr, alice);
    expect(Number(clearAtk)).to.eq(atk);
    expect(Number(clearDef)).to.eq(defn);

    const tokens = await game.tokensOfOwner(alice.address);
    expect(tokens.length).to.eq(1);
    expect(tokens[0]).to.eq(tid);
  });
});

