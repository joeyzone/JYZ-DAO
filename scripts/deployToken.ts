import { ethers } from "hardhat";

async function main() {
  const token = await ethers.deployContract("JYZToken");

  await token.waitForDeployment();

  console.log(`JYZToken deployed to ${token.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
