pragma solidity ^0.5.0;

import "@openzeppelin/contracts/access/roles/WhitelistedRole.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Full.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";

contract LoanShark is ERC721Full, WhitelistedRole {

    struct Loan {
        // Config
        address lender;
        uint256 tokenId;
        address borrower;

        // state flags
        bool isEscrowed;
        bool isBorrowed;

        // payment terms
        uint256 costPerMinute;
        uint256 maxMinutesAvailableForHire;
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

    function enableTokenForLending(uint256 _tokenId, uint256 _costPerMinute, uint256 _maxMinutesAvailableForHire) public returns (bool) {

        // Validate input
        require(_costPerMinute > 0, "Cannot loan the token for free");
        require(_maxMinutesAvailableForHire > 0, "Cannot lend a token for less than 1 minute");
        require(tokensAvailableToLoan[_tokenId].tokenId == 0, "Token already placed for sale");

        // Validate caller owns it
        require(tokenContract.ownerOf(_tokenId) == msg.sender, "Caller does not own the NFT");

        // Setup Loan
        tokensAvailableToLoan[_tokenId] = Loan({
            tokenId : _tokenId,
            lender : msg.sender,
            borrower : address(this),

            isEscrowed : true,
            isBorrowed : false,

            costPerMinute : _costPerMinute,
            maxMinutesAvailableForHire : _maxMinutesAvailableForHire
            });

        // Escrow NFT into the Loan Shark Contract
        tokenContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        require(isTokenEscrowed(_tokenId), "Token not correctly escrowed");

        return true;
    }

    function borrowToken(uint256 _tokenId, uint256 _totalCommitment) public returns (bool) {
        require(tokensAvailableToLoan[_tokenId].tokenId != 0, "Token not for sale");

        Loan storage loan = tokensAvailableToLoan[_tokenId];
        require(loan.isEscrowed, "Token not escrowed");
        require(!loan.isBorrowed, "Token already borrowed");
        require(loan.borrower == address(0), "Token already got a borrower");


        // sudo transfer this NFT to the new owner
        loan.borrower = msg.sender;
        loan.isBorrowed = true;

        // TODO start the stream....?

        // enable proxy methods to display original
        // update state to show item is user

        return true;
    }

    function returnNft(uint256 _tokenId) public {
        require(tokensAvailableToLoan[_tokenId].tokenId != 0, "Token not for sale");

        // NFT is taken back in true full control on this proxy
        // NFT reset loan state
    }

    function pullBackOverdueNft(uint256 _tokenId) public {
        require(tokensAvailableToLoan[_tokenId].tokenId != 0, "Token not for sale");

        // only allow after loan has expired
        // take back ownership from the borrower
        // reset loan state
        // penalise the borrower in some form?
    }

    // taking ownership of the NFT via callback confirmation
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data) public returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function isTokenEscrowed(uint256 _tokenId) public view returns (bool) {
        return IERC721Full(tokenContract).ownerOf(_tokenId) == address(this);
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

    function tokenURI(uint256 _tokenId) external view returns (string memory) {
        Loan memory loan = tokensAvailableToLoan[_tokenId];
        if (loan.isBorrowed) {
            return tokenContract.tokenURI(_tokenId);
        }
        return "TODO return static IPFS hash";
    }

    ////////////////////////////////
    // Overridden IERC721 methods //
    ////////////////////////////////

    // TODO proxy through to escrowed NFT
    // TODO special case methods which need to be thought about
    // TODO check expired stream as well for all proxy methods?

    function balanceOf(address owner) public view returns (uint256) {
        // TODO how to handle this proxy method
        return tokenContract.balanceOf(owner);
    }

    function ownerOf(uint256 _tokenId) public view returns (address) {
        Loan memory loan = tokensAvailableToLoan[_tokenId];
        if (loan.isBorrowed) {
            return tokenContract.ownerOf(_tokenId);
        }
        return address(this);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public {
        Loan memory loan = tokensAvailableToLoan[tokenId];
        require(!loan.isBorrowed, "Cannot transfer a borrowed contract");
        require(!loan.isEscrowed, "Cannot transfer a escrowed contract");

        return tokenContract.safeTransferFrom(from, to, tokenId, _data);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        Loan memory loan = tokensAvailableToLoan[tokenId];
        require(!loan.isBorrowed, "Cannot transfer a borrowed contract");
        require(!loan.isEscrowed, "Cannot transfer a escrowed contract");

        return tokenContract.transferFrom(from, to, tokenId);
    }

}
