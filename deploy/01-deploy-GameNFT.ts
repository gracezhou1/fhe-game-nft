import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as fs from "fs";
import * as path from "path";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, getArtifact, get } = hre.deployments;

  const deployed = await deploy("GameNFT", {
    from: deployer,
    args: ["FHE Game NFT", "FGEN"],
    log: true,
  });

  console.log(`GameNFT contract: ${deployed.address}`);

  // Prepare ABI export for frontend (TS, not JSON)
  try {
    const deployment = await hre.deployments.get("GameNFT");
    const abi = deployment.abi;

    const outDir = path.join(process.cwd(), "home", "src", "abi");
    const outFile = path.join(outDir, "GameNFT.ts");
    fs.mkdirSync(outDir, { recursive: true });
    const content = `// Auto-generated on deploy\nexport const address = "${deployed.address}";\nexport const abi = ${JSON.stringify(abi, null, 2)} as const;\n`;
    fs.writeFileSync(outFile, content, { encoding: "utf-8" });
    console.log(`Wrote ABI to ${outFile}`);
  } catch (e) {
    console.warn("Failed to write frontend ABI:", e);
  }
};

export default func;
func.id = "deploy_game_nft";
func.tags = ["GameNFT"];
