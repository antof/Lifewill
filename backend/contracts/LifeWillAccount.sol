// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract LifeWillAccount is ERC721, Ownable {

    address private immutable isUnlockedManager;

    constructor(address _owner, address _isUnlockedManager) ERC721("LifewillAccount", "LWNFT") Ownable(_owner) {
        isUnlockedManager = _isUnlockedManager;
        key = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.difficulty,
                    msg.sender
                )
            )
        );
    }

    event DocumentSent(uint256 docId, string text);
    event DocumentRemoved(uint256 docId);

    bool isUnlocked;
    uint256 private key;
    uint256 private tokenIdCounter = 0;

    mapping(uint256 => string) private documentsURI;
    mapping(uint256 => bool) public isDocumentActive;

    function addDocument(address to, string memory _text) external onlyOwner {
        string memory encryptedText = encrypt(_text);
        _safeMint(to, tokenIdCounter);
        documentsURI[tokenIdCounter] = encryptedText;
        isDocumentActive[tokenIdCounter] = true;
        emit DocumentSent(tokenIdCounter, encryptedText);
        tokenIdCounter += 1;
    }

    function removeDocument(uint256 tokenId) external onlyOwner {
        require(isDocumentActive[tokenId], "Document already removed");
        _burn(tokenId);
        isDocumentActive[tokenId] = false;
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

    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer failed");
        }
        return super._update(to, tokenId, auth);
    }

    function getTokenIdCounter() public view returns (uint256) {
        return tokenIdCounter;
    }

    function getDocument(uint256 documentId) public view returns (string memory) {
        require(isDocumentActive[documentId], "Document is not active");
        require(
            msg.sender == owner() || 
            (msg.sender == ownerOf(documentId) && isUnlocked), 
            "Caller is not authorized"
        );
        string memory encryptedText = documentsURI[documentId];
        return decrypt(encryptedText);
    }

    function setUnlocked(bool _isUnlocked) external {
        require(msg.sender == isUnlockedManager, "Caller is not authorized to modify isUnlocked");
        isUnlocked = _isUnlocked;
    }

    function getIsUnlocked() external view returns (bool) {
        return isUnlocked;
    }

    function encrypt(string memory plaintext) internal view returns (string memory) {
        bytes memory data = bytes(plaintext);
        for (uint256 i = 0; i < data.length; i++) {
            data[i] = bytes1(uint8(data[i]) ^ uint8(key >> (i % 32)));
        }
        return string(data);
    }

    function decrypt(string memory ciphertext) internal view returns (string memory) {
        bytes memory data = bytes(ciphertext);
        for (uint256 i = 0; i < data.length; i++) {
            data[i] = bytes1(uint8(data[i]) ^ uint8(key >> (i % 32)));
        }
        return string(data);
    }
}
