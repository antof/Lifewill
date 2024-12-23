const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LifeWill", (m) => {

  const createAccount = m.contract("CreateAccount");

  return { createAccount };
});
