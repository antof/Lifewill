// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract LifeWillAccount is ERC721, Ownable{


    constructor(address owner) ERC721("LifewillAccount","LWNFT") Ownable(owner)
    {
        key =   uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.difficulty,
                        msg.sender
                    )));
    }

    bool isUnlocked;
    uint256 key;
    uint256 tokenIdCounter = 0;

    mapping(uint256 => string) documentsURI;

    function addDocument(address to) external onlyOwner {
        _safeMint(to, tokenIdCounter);
        tokenIdCounter+=1;
    }
  
    function _update(address to, uint256 tokenId, address auth) internal  virtual override(ERC721)
    returns (address)
    {
    address from = _ownerOf(tokenId);
    if (from != address(0) && to != address(0)) {
        revert("Soulbound: Transfer failed");
    }
    return super._update(to, tokenId, auth);
    }

    function removeDocument(uint256 tokenId) external onlyOwner
    {
        _burn(tokenId);
        delete(documentsURI[tokenId]);
    }

}
