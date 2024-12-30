const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Mint", function () {

  //we create an account and then mint a token
  async function createAccountAndAddDocument() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const CreateAccount = await ethers.deployContract("CreateAccount")


    return { CreateAccount, owner, otherAccount };
  }

  describe("Mint", function () {
    it("Should mint a token for otherAccount", async function () {
      const [owner, otherAccount] = await ethers.getSigners();

      const CreateAccountFact = await ethers.getContractFactory('CreateAccount');
      const LifeWillAccount = await ethers.getContractFactory('LifeWillAccount')
      const createAccount = await CreateAccountFact.deploy();
      await createAccount.waitForDeployment();
      await createAccount.register();
      const contractadd = await createAccount.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd)
      const ownerofAcc = await userAccount.owner()
      console.log("owner of the account is ", ownerofAcc)
      await userAccount.addDocument(otherAccount);
      expect(createAccount.isRegistred(owner) == true);
    });
  })
});
