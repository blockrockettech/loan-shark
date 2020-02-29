pragma solidity 0.5.14;

import "@openzeppelin/contracts/access/roles/WhitelistedRole.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Full.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "./sablier/IERC1620.sol";

contract LoanShark is ERC721Full, WhitelistedRole {

    struct Loan {
        // Config
        address lender;
        uint256 tokenId;
        address borrower;

        // state flags
        bool isEscrowed;
        bool isBorrowed;
        //
        //        // payment terms
        //        uint256 costPerMinute;
        //        uint256 maxMinutesAvailableForHire;

        uint256 start;
        uint256 end;
        uint256 depositInWei;
    }

    // What to stream the payment in
    IERC20 public paymentToken;

    // The original NFT contract
    IERC721Full public tokenContract;

    // Sablier stream for payments
    IERC1620 stream;

    mapping(uint256 => Loan) public tokensAvailableToLoan;

    mapping(address => uint256[]) public lenderToTokenId;

    // So we can enumerate them
    uint256 public totalTokens = 0;
    mapping(uint256 => uint256) public indexToTokenId;

    mapping(uint256 => uint256) public tokenIdToStreamId;

    constructor(
        IERC721Full _tokenContract, // How to make this generic to not accept a token at construction
        IERC20 _paymentToken, // DAI ... or even zkDAI ?
        IERC1620 _stream
    ) ERC721Full("LoanShark", "LSK🦈") public {
        super.addWhitelisted(msg.sender);

        paymentToken = _paymentToken;
        tokenContract = _tokenContract;
        stream = _stream;

        // approve the stream to pull whatever they want from LoanShark
        paymentToken.approve(address(stream), uint(- 1));
    }

    // TODO create a proxy method to allow call on original NFT by bytecode/method args - dynamic lookup?

    function enableTokenForLending(uint256 _tokenId, uint256 _start, uint256 _end, uint256 _depositInWei) public returns (bool) {

        // Validate input
        //        require(_costPerMinute > 0, "Cannot loan the token for free");
        require(tokensAvailableToLoan[_tokenId].tokenId == 0, "Token already placed for sale");

        // Validate caller owns it
        require(tokenContract.ownerOf(_tokenId) == msg.sender, "Caller does not own the NFT");

        // Setup Loan
        tokensAvailableToLoan[_tokenId] = Loan({
            tokenId : _tokenId,
            lender : msg.sender,
            borrower : address(0x0),

            isEscrowed : true,
            isBorrowed : false,

            start : _start,
            end : _end,

            depositInWei : _depositInWei
            });

        // Escrow NFT into the Loan Shark Contract
        tokenContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        require(isTokenEscrowed(_tokenId), "Token not correctly escrowed");

        // Setup simple enumeration
        indexToTokenId[totalTokens] = _tokenId;
        totalTokens = totalTokens + 1;

        // setup simple lender mapping
        lenderToTokenId[msg.sender].push(_tokenId);

        return true;
    }

    /*
     * Close any outstanding un-borrowed NFT loans
     * Send the NFT back to the original lender
     */
    function cancelLoan(uint256 _tokenId) public returns (bool) {
        require(tokensAvailableToLoan[_tokenId].tokenId != 0, "Token not for sale");

        Loan storage loan = tokensAvailableToLoan[_tokenId];
        require(loan.isEscrowed, "Token not escrowed");
        require(!loan.isBorrowed, "Token already borrowed");
        require(loan.borrower != address(0), "Token already got a borrower");

        address originalLender = loan.lender;

        delete tokensAvailableToLoan[_tokenId];

        // Send the loan back to the original lender
        tokenContract.safeTransferFrom(address(this), originalLender, _tokenId);
        require(isTokenOwnedBy(_tokenId, originalLender), "Token not returned successfully");

        return true;
    }

    function borrowToken(uint256 _tokenId) public returns (bool) {
        require(tokensAvailableToLoan[_tokenId].tokenId != 0, "Token not for sale");

        Loan storage loan = tokensAvailableToLoan[_tokenId];
        require(loan.isEscrowed, "Token not escrowed");
        require(!loan.isBorrowed, "Token already borrowed");
        require(loan.borrower == address(0), "Token already got a borrower");

        // sudo transfer this NFT to the new owner
        loan.borrower = msg.sender;
        loan.isBorrowed = true;

        // deposit here in escrow to set up stream
        paymentToken.transferFrom(msg.sender, address(this), loan.depositInWei);

        // this will pull the escrowed amount into the stream
        uint256 streamId = stream.createStream(loan.lender, loan.depositInWei, address(paymentToken), loan.start, loan.end);

        tokenIdToStreamId[_tokenId] = streamId;
        return true;
    }

    function returnBorrowedNft(uint256 _tokenId) public returns (bool) {
        require(tokensAvailableToLoan[_tokenId].tokenId != 0, "Token not for sale");

        Loan storage loan = tokensAvailableToLoan[_tokenId];
        require(loan.isEscrowed, "Token not escrowed");
        require(loan.isBorrowed, "Token not borrowed");
        require(loan.borrower == msg.sender, "Token not borrowed by caller");

        // sudo transfer this NFT back to the escrow
        loan.borrower = address(0);
        loan.isBorrowed = false;

        // TODO close stream .... ?

        return true;
    }

    function clawBackNft(uint256 _tokenId) public {
        require(tokensAvailableToLoan[_tokenId].tokenId != 0, "Token not for sale");

        // only allow after loan has expired
        // take back ownership from the borrower
        // reset loan state
        // penalise the borrower in some form?
    }

    /////////////////////
    // Query utilities //
    /////////////////////

    function getLoanDetails(uint _tokenId) public view returns (
        address lender,
        address borrower,
        bool isEscrowed,
        bool isBorrowed,
        uint256 start,
        uint256 end
    ) {
        Loan memory loan = tokensAvailableToLoan[_tokenId];
        return (
        loan.lender,
        loan.borrower,
        loan.isEscrowed,
        loan.isBorrowed,
        loan.start,
        loan.end
        );
    }

    function cancel(uint _tokenId) public returns (bool) {

        uint256 streamId = tokenIdToStreamId[_tokenId];
        require(streamId > 0, "Must have a stream");

        Loan memory loan = tokensAvailableToLoan[_tokenId];
        require(msg.sender == loan.lender, "Must be lender");

        stream.cancelStream(streamId);
//        safeTransferFrom(loan.borrower, loan.lender, _tokenId);

        return paymentToken.transfer(loan.borrower, paymentToken.balanceOf(address(this)));
    }


    function getRemainingTimeLeftForLoan(uint _tokenId) public returns (uint256) {
        uint256 streamId = tokenIdToStreamId[_tokenId];
        require(streamId > 0, "Must have a stream");

        Loan memory loan = tokensAvailableToLoan[_tokenId];

        if (block.timestamp <= loan.start) return loan.end - loan.start;
        if (block.timestamp > loan.end) return 0;

        return loan.end - stream.deltaOf(streamId);
    }

    function getRemainingStreamBalance(uint _tokenId) public returns (uint256) {
        uint256 streamId = tokenIdToStreamId[_tokenId];
        require(streamId > 0, "Must have a stream");

        Loan memory loan = tokensAvailableToLoan[_tokenId];
        require(msg.sender == loan.lender, "Must be lender");

        return stream.balanceOf(streamId, loan.lender);
    }

    function withdraw(uint _tokenId) public returns (bool) {
        uint256 streamId = tokenIdToStreamId[_tokenId];
        require(streamId > 0, "Must have a stream");

        Loan memory loan = tokensAvailableToLoan[_tokenId];
        require(msg.sender == loan.lender, "Must be lender");

        clawBackNft(_tokenId);

        return stream.withdrawFromStream(streamId, stream.balanceOf(streamId, loan.lender));
    }

    ////////////////////
    // Internal utils //
    ////////////////////

    function getTokenIdForIndex(uint256 _index) public view returns (uint256) {
        return indexToTokenId[_index];
    }

    function getTokensLenderIsBorrowing(address _lender) public view returns (uint256[] memory) {
        uint256[] memory tokenIds = lenderToTokenId[_lender];
        return tokenIds;
    }

    // taking ownership of the NFT via callback confirmation
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data) public returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function isTokenEscrowed(uint256 _tokenId) public view returns (bool) {
        return isTokenOwnedBy(_tokenId, address(this));
    }

    function isTokenOwnedBy(uint256 _tokenId, address _owner) public view returns (bool) {
        return IERC721Full(tokenContract).ownerOf(_tokenId) == _owner;
    }

    ////////////////////////////////////////
    // Overridden IERC721Metadata methods //
    ////////////////////////////////////////

    function name() public view returns (string memory) {
        return tokenContract.name();
    }

    function symbol() public view returns (string memory) {
        return tokenContract.symbol();
    }

    function tokenURI(uint256 _tokenId) public view returns (string memory) {
        Loan memory loan = tokensAvailableToLoan[_tokenId];
        if (loan.isBorrowed) {
            return tokenContract.tokenURI(_tokenId);
        }
        // Static IPFS data for a loan shark NFT
        return "https://ipfs.infura.io/ipfs/QmYA3fazKWXsiRXYDDyHxBKBi8udERjaRzjtPRNC2DKj3Z";
    }

    function getPrincipleTokenUri(uint256 _tokenId) public view returns (string memory) {
        return tokenContract.tokenURI(_tokenId);
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
