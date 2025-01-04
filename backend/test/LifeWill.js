const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { bigint } = require("hardhat/internal/core/params/argumentTypes");

describe("Init", function () {
  let createAccountContract;
  let deployer;
  let user1;
  let user2;
  let LifeWillAccount;
  let unlocker;

  beforeEach(async function () {
    // Get signers for tests
    [deployer, user1, user2] = await ethers.getSigners();

    // Deploy contract
    CreateAccountFact = await ethers.getContractFactory('CreateAccount');
    createAccountContract = await CreateAccountFact.deploy();
    await createAccountContract.waitForDeployment();
    LifeWillAccount = await ethers.getContractFactory('LifeWillAccount')
    unlocker = await ethers.getImpersonatedSigner("0x38E59c54F40087bdB2771C1867113e0C2cb52633");
    await deployer.sendTransaction({
      to: unlocker,
      value: ethers.parseEther("1.0"), // get funds on the uncloker wallet to test unlock feature
    });


});

  describe("CreateAccountTest", function () {
    it("Register and test if isRegistred return true", async function () {
      await createAccountContract.register();
      expect(await createAccountContract.isRegistred(deployer)).to.equal(true);
    });

    it("isRegistred return false if not registred", async function () {
      expect(await createAccountContract.isRegistred(deployer)).to.equal(false);
    });

    it("Register and see if getAccount doesn't return null address", async function () {
      await createAccountContract.register();
      expect(await createAccountContract.getUserAccount()).to.not.equal(ethers.ZeroAddress);
    });

    it("See if getAccount returns null address for someone not registered", async function () {
      expect(await createAccountContract.getUserAccount()).to.equal(ethers.ZeroAddress);
    });

    it("Check that isManager returns false if signer is not the manager", async function () {
      expect(await createAccountContract.isManager()).to.equal(false);
    });

    it("Check that isManager returns true if signer is the manager", async function () {
      expect(await createAccountContract.connect(unlocker).isManager()).to.equal(true);
    });

    it("Check that getlockedmnager returns the manager address", async function () {
      expect(await createAccountContract.getUnlockedManager()).to.equal(unlocker);
    });
  })

  describe("LifeWillAccount", function () {
    it("the owner of the lifewill account is the one that registred it", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      expect(await userAccount.owner()).to.equal(deployer);
    })

    it("the owner can mint", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      expect(await userAccount.addDocument(user1, "Secret message")).to.not.be.reverted;
    })

    it("not owner can't mint", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      await expect(userAccount.connect(user2).addDocument(user1, "Secret message")).to.be.revertedWithCustomError(userAccount, "OwnableUnauthorizedAccount");
    })

    it("the owner can burn", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      await userAccount.addDocument(user1, "Secret message");
      expect(await userAccount.removeDocument(0)).to.not.be.reverted;
    })

    it("document not active", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      await userAccount.addDocument(user1, "Secret message");
      await userAccount.removeDocument(0);
      await expect(userAccount.getDocument(0)).to.not.be.revertedWithoutReason("Document is not active");
    })

    
    it("can't remove already removed document", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      await userAccount.addDocument(user1, "Secret message");
      await userAccount.removeDocument(0);
      await expect(userAccount.removeDocument(0)).to.be.revertedWith("Document already removed");
    })

    it("can get active documents", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      await userAccount.addDocument(user1, "Secret message");
      await expect(userAccount.getActiveDocuments()[0]).to.equal();
    })

    it("can get document if i'm the nft owner and the contract is unlcoked", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      await userAccount.addDocument(user1,"secret message !");
      await userAccount.connect(unlocker).setUnlocked(true);
      expect(await userAccount.connect(user1).getDocument(0)).to.not.be.reverted;
    })

    it("can get document if i'm the contract owner", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      await userAccount.addDocument(user1,"secret message !");
      expect(await userAccount.getDocument(0)).to.not.be.reverted;
    })

    it("owner can't transfer token", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      await userAccount.addDocument(user1, "Secret message");
      await expect(userAccount.connect(user1).safeTransferFrom(user1,user2,0)).to.be.revertedWith("Soulbound: Transfer failed");
    })

    it("GetTokenIdCounter", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      await userAccount.addDocument(user1, "Secret message");
      expect(await userAccount.getTokenIdCounter()).to.equal(BigInt(1))
    })

    it("can't set unlocked if not manager", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      await expect(userAccount.setUnlocked(true)).to.be.revertedWith("Caller is not authorized to modify isUnlocked");
    })

    it("manager can unlock", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      expect(await userAccount.connect(unlocker).setUnlocked(true)).to.not.be.reverted;
    })

    it("GetUncloked should be true after unlock", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      await userAccount.connect(unlocker).setUnlocked(true)
      expect(await userAccount.getIsUnlocked()).to.equal(true);
    })

    it("GetUncloked should be false if no unlock", async function () {
      await createAccountContract.register();
      const contractadd = await createAccountContract.getUserAccount();
      const userAccount = await LifeWillAccount.attach(contractadd);
      expect(await userAccount.getIsUnlocked()).to.equal(false);
    })
  })
});
