import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { JYZToken } from "../typechain-types";

async function deployTokenFixture() {
  const Token = await ethers.getContractFactory("JYZToken");
  const token: JYZToken = await Token.deploy();
  return { token };
}

describe("JYZToken", function () {
  it("should be able to mint", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const { token } = await loadFixture(deployTokenFixture);
    expect(await token.balanceOf(owner.address)).to.equal(
      ethers.parseEther("1000000000")
    );
  });
  it("should be right permit", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const { token } = await loadFixture(deployTokenFixture);
    const domainALL = await token.eip712Domain();
    const domain = {
      name: domainALL.name,
      version: domainALL.version,
      chainId: domainALL.chainId,
      verifyingContract: domainALL.verifyingContract,
    };
    const nonce = await token.ownerNonce(owner);
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    };
    const permitData = {
      owner: owner.address,
      spender: addr1.address,
      amount: ethers.parseEther("1"),
      nonce,
    };
    const signature = await owner.signTypedData(domain, types, permitData);

    await token.permit(
      permitData.owner,
      permitData.spender,
      permitData.amount,
      signature
    );

    const allowance = await token.allowance(owner.address, addr1.address);
    expect(allowance).to.be.equal(ethers.parseEther("1"));
  });
});
