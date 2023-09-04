import { ethers } from "hardhat";

async function main() {
  const token = process.env.TOKEN;
  const dao = await ethers.deployContract("JYZDao", [token]);

  await dao.waitForDeployment();

  console.log(`JYZDao deployed to ${dao.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
