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

    event DocumentSent(uint256 docId, string text);
    event DocumentRemoved(uint256 docId);


    bool isUnlocked;
    uint256 key;
    uint256 tokenIdCounter = 0;

    mapping(uint256 => string) documentsURI;

    mapping(uint256 => bool) public isDocumentActive; // Pour suivre les documents actifs

    function addDocument(address to, string memory _text) external onlyOwner {
        _safeMint(to, tokenIdCounter);
        documentsURI[tokenIdCounter] = _text;
        isDocumentActive[tokenIdCounter] = true; // Marquer le document comme actif
        emit DocumentSent(tokenIdCounter, _text);
        tokenIdCounter += 1;
    }

    function removeDocument(uint256 tokenId) external onlyOwner {
        require(isDocumentActive[tokenId], "Document already removed");
        _burn(tokenId);
        isDocumentActive[tokenId] = false; // Marquer le document comme inactif
        emit DocumentRemoved(tokenId);
        delete documentsURI[tokenId];
    }

    function getActiveDocuments() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < tokenIdCounter; i++) {
            if (isDocumentActive[i]) {
                activeCount++;
            }
        }

        uint256[] memory activeIds = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < tokenIdCounter; i++) {
            if (isDocumentActive[i]) {
                activeIds[index] = i;
                index++;
            }
        }
        return activeIds;
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

    function getTokenIdCounter() public view returns(uint256)
    {
        return tokenIdCounter;
    }

    function getDocument(uint256 documentId) public view returns(string memory)
    {
        return documentsURI[documentId];
    }

}
