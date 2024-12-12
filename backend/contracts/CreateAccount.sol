// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "./LifeWillAccount.sol";

contract CreateAccount {

    mapping(address => address) accounts;

    function isRegistred(address _userAddress) public view returns(address _smartContractAddress)
    {
        return accounts[_userAddress];
    }

    function register() public
    {
        require(accounts[msg.sender] == address(0),"You can create only one LifeWill Account");
        LifeWillAccount account = new LifeWillAccount(msg.sender);
        accounts[msg.sender] = address(account);
    }

}
