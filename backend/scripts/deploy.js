async function main() {
  const CreateAccountFact = await ethers.getContractFactory('CreateAccount');
  const createAccount = await CreateAccountFact.deploy();
  console.log("Deploying contract...");
  await createAccount.waitForDeployment();
  contractAddress = await createAccount.getAddress();

  console.log("Contract deployed to:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
