pragma solidity ^0.5.0;

import "@openzeppelin/contracts/access/roles/WhitelistedRole.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Full.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";

contract LoanShark is ERC721Full, WhitelistedRole {

    struct Loan {
        address lender;
        uint256 tokenId;
        uint256 costPerDay;
        uint256 maxNumberOfDays;
        bool isEscrowed;
        address isBorrowed;
        address borrower;
    }

    // What to stream the payment in
    IERC20 public paymentToken;

    // The original NFT contract
    IERC721Full public tokenContract;

    // Total
    mapping(uint256 => Loan) public tokensAvailableToLoan;

    constructor(
        IERC721Full _tokenContract, // How to make this generic to not accept a token at construction
        IERC20 _paymentToken // DAI ... or even zkDAI ?
    ) ERC721Full("LoanShark", "LSK🦈") public {
        super.addWhitelisted(msg.sender);

        paymentToken = _paymentToken;
        tokenContract = _tokenContract;
    }
    // TODO create a proxy method to allow call on original NFT by bytecode/method args - dynamic lookup?

    function placeItemFoSale(uint256 _tokenId, uint256 _costPerDay, uint256 _maxNumberOfDays) public returns (bool) {
        return true;
    }


    function takeNft(uint256 _tokenId, uint256 _totalCommitment) public {
        // sudo transfer this NFT to the new owner
        // enable proxy methods to display original
        // update state to show item is user
    }

    function returnNft(uint256 _tokenId) public {
        // NFT is taken back in true full control on this proxy
        // NFT reset loan state
    }

    function pullBackOverdueNft(uint256 _tokenId) public {
        // only allow after loan has expired
        // take back ownership from the borrower
        // reset loan state
        // penalise the borrower in some form?
    }

    // taking ownership of the NFT via callback confirmation
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data) public returns (bytes4) {
        emit ItemReceived(operator, from, tokenId, data, gasleft());
        return this.onERC721Received.selector;
    }

    ////////////////////////////////////////
    // Overridden IERC721Metadata methods //
    ////////////////////////////////////////

    // TODO proxy through to escrowed NFT

    function name() external view returns (string memory) {
        return tokenContract.name();
    }

    function symbol() external view returns (string memory) {
        return tokenContract.symbol();
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        return tokenContract.tokenURI(tokenId);
    }

    ////////////////////////////////
    // Overridden IERC721 methods //
    ////////////////////////////////

    // TODO proxy through to escrowed NFT
    // TODO special case methods which need to be thought about

    function balanceOf(address owner) public view returns (uint256) {
        return tokenContract.balanceOf(owner);
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        return tokenContract.ownerOf(tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public {
        return tokenContract.safeTransferFrom(from, to, tokenId, _data);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        return tokenContract.transferFrom(from, to, tokenId);
    }

}
