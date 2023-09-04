import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    zkEVM: {
      url: `https://rpc.public.zkevm-test.net`,
      accounts: [PRIVATE_KEY || ""],
    },
  },
};

export default config;
