// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "./LifeWillAccount.sol";

contract CreateAccount {

    address private immutable isUnlockedManager;

    constructor()
    {
        isUnlockedManager = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    }

    mapping(address => address) accounts;

    event AccountCreated(address creator, address contractAddress);

    function isRegistred(address _userAddress) public view returns(bool)
    {
        return accounts[_userAddress] != address(0);
    }

    function getUserAccount() public view returns(address)
    {
        return accounts[msg.sender];
    }

    function register() public
    {
        require(accounts[msg.sender] == address(0),"You can create only one LifeWill Account");
        LifeWillAccount account = new LifeWillAccount(msg.sender, isUnlockedManager);
        accounts[msg.sender] = address(account);
        emit AccountCreated(msg.sender, address(account));
    }

    function isManager() public view returns(bool)
    {
        return msg.sender == isUnlockedManager;
    }

    function getUnlockedManager() external view returns (address) {
    return isUnlockedManager;
}

}
