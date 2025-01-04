async function main() {
  const CreateAccountFact = await ethers.getContractFactory('CreateAccount');
  const createAccount = await CreateAccountFact.deploy();
  console.log("Deploying contract...");
  await createAccount.waitForDeployment();


  console.log("Contract deployed to:", createAccount.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
