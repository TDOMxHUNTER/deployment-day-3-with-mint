
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MonadProfileNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    uint256 public constant MINT_PRICE = 0.01 ether;
    uint256 public constant MAX_SUPPLY = 10000;
    
    struct ProfileData {
        string name;
        string title;
        string handle;
        string avatarUrl;
        uint256 timestamp;
        address minter;
    }
    
    mapping(uint256 => ProfileData) public profileData;
    mapping(address => uint256[]) public userTokens;
    mapping(string => bool) public handleExists;
    
    event ProfileMinted(
        uint256 indexed tokenId,
        address indexed minter,
        string name,
        string handle,
        string metadataURI
    );
    
    constructor() ERC721("Monad Profile NFT", "MPN") {}
    
    function mintProfile(
        string memory _name,
        string memory _title,
        string memory _handle,
        string memory _avatarUrl,
        string memory _metadataURI
    ) public payable nonReentrant {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        require(!handleExists[_handle], "Handle already exists");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_handle).length > 0, "Handle cannot be empty");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _metadataURI);
        
        profileData[newTokenId] = ProfileData({
            name: _name,
            title: _title,
            handle: _handle,
            avatarUrl: _avatarUrl,
            timestamp: block.timestamp,
            minter: msg.sender
        });
        
        userTokens[msg.sender].push(newTokenId);
        handleExists[_handle] = true;
        
        emit ProfileMinted(newTokenId, msg.sender, _name, _handle, _metadataURI);
    }
    
    function getUserTokens(address user) public view returns (uint256[] memory) {
        return userTokens[user];
    }
    
    function getProfileData(uint256 tokenId) public view returns (ProfileData memory) {
        require(_exists(tokenId), "Token does not exist");
        return profileData[tokenId];
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    function updateTokenURI(uint256 tokenId, string memory newURI) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _setTokenURI(tokenId, newURI);
    }
    
    function isHandleAvailable(string memory _handle) public view returns (bool) {
        return !handleExists[_handle];
    }
}
