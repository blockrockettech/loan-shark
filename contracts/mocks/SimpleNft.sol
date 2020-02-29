pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721MetadataMintable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Enumerable.sol";

contract SimpleNft is ERC721MetadataMintable, ERC721Enumerable {

    constructor()
    ERC721MetadataMintable()
    ERC721Metadata("SimpleNft", "sNFT") public  {
        //
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _tokensOfOwner(owner);
    }

    function mintWithTokenURI(address to, uint256 tokenId, string memory tokenURI) public returns (bool) {
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return true;
    }

}
