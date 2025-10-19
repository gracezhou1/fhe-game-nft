import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("game:address", "Prints the GameNFT address").setAction(async (_args, hre) => {
  const d = await hre.deployments.get("GameNFT");
  console.log("GameNFT:", d.address);
});

task("game:attack", "Attack a monster: easy|hard|hell")
  .addParam("difficulty", "easy|hard|hell")
  .setAction(async (args: TaskArguments, hre) => {
    const { ethers, deployments } = hre;
    const dep = await deployments.get("GameNFT");
    const game = await ethers.getContractAt("GameNFT", dep.address);
    const s = await ethers.getSigners();

    let d = 0;
    const v = String(args.difficulty).toLowerCase();
    if (v === "easy") d = 0; else if (v === "hard") d = 1; else if (v === "hell") d = 2; else throw new Error("invalid difficulty");

    const tx = await game.connect(s[0]).attackMonster(d);
    console.log("tx:", tx.hash);
    const rcpt = await tx.wait();
    console.log("status:", rcpt?.status);
  });

task("game:decrypt-stats", "Decrypt stats for tokenId")
  .addParam("tokenid", "Token ID")
  .setAction(async (args: TaskArguments, hre) => {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const dep = await deployments.get("GameNFT");
    const game = await ethers.getContractAt("GameNFT", dep.address);
    const s = await ethers.getSigners();

    const tid = BigInt(args.tokenid);
    const atk = await game.attackOf(tid);
    const defn = await game.defenseOf(tid);

    const clearAtk = await fhevm.userDecryptEuint(FhevmType.euint32, atk, dep.address, s[0]);
    const clearDef = await fhevm.userDecryptEuint(FhevmType.euint32, defn, dep.address, s[0]);
    const rarity = await game.rarityOf(tid);

    console.log("rarity:", rarity.toString());
    console.log("attack:", clearAtk.toString());
    console.log("defense:", clearDef.toString());
  });

