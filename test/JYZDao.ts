import { ethers } from "hardhat";
import { JYZToken, JYZDao, IERC20 } from "../typechain-types";
import { expect } from "chai";

async function deployTokenFixture() {
  const Token = await ethers.getContractFactory("JYZToken");
  const token: JYZToken = await Token.deploy();
  return { token };
}

async function deployDaoFixture() {
  const { token } = await deployTokenFixture();
  const Dao = await ethers.getContractFactory("JYZDao");
  const dao: JYZDao = await Dao.deploy(await token.getAddress());
  return { token, dao };
}

describe("JYZ DAO", async function () {
  it("should deploy JYZ DAO contract", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const { dao } = await deployDaoFixture();
    expect(await dao.owner()).to.equal(await owner.getAddress());
  });

  it("should add Topic right", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const { token } = await deployTokenFixture();
    const { dao } = await deployDaoFixture();
    // const ownerBalance = await token.balanceOf(await owner.getAddress());
    // await token.transfer(
    //   addr1.address,
    //   ethers.parseEther("500000000000000000000000000")
    // );
    const topicHash = ethers.keccak256("0x");
    await dao.addTopic(
      topicHash,
      50,
      "this is a test topic",
      Math.ceil(Date.now() / 1000) + 7 * 24 * 60 * 60
    );
    expect((await dao.topicMap(topicHash)).topicHash).to.equal(topicHash);
  });
  it("should be vote number right", async function () {
    const [owner, addr1] = await ethers.getSigners();
    // It's easy to make mistakes here
    // const { token } = await deployTokenFixture();
    const { token, dao } = await deployDaoFixture();
    // const tokenAddr = await dao.token();
    // const token = await ethers.getContractAt("JYZToken", tokenAddr);
    const ownerBalance = await token.balanceOf(await owner.getAddress());

    await token.transfer(addr1.address, ownerBalance / BigInt(2));
    const topicHash = ethers.keccak256("0x");
    await dao.addTopic(
      topicHash,
      49,
      "this is a test topic",
      Math.ceil(Date.now() / 1000) + 7 * 24 * 60 * 60
    );
    await dao.connect(addr1).favorTopic(topicHash);
    expect((await dao.topicMap(topicHash)).isPass).to.be.true;
  });
});
