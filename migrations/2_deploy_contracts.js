const LoanShark = artifacts.require('./LoanShark.sol');
const SimpleNft = artifacts.require('./SimpleNft.sol');
const MockDAI = artifacts.require('./MockDAI.sol');
const Sablier = artifacts.require('./Sablier.sol');

module.exports = async function (deployer, network, accounts) {
    // Deploy simple NFT
    await deployer.deploy(SimpleNft);
    const simpleNft = await SimpleNft.deployed();

    // Deploy fake DAI
    await deployer.deploy(MockDAI);
    const mockDAI = await MockDAI.deployed();

    const deposit = "2999999999999998944000"; // almost 3,000, but not quite

    // Give the first 3 accounts 10k in fake DAI
    await mockDAI.mint(accounts[0], deposit);
    await mockDAI.mint(accounts[1], deposit);
    await mockDAI.mint(accounts[2], deposit);

    // Deploy Sablier
    await deployer.deploy(Sablier);
    const sablier = await Sablier.deployed();

    const DAI = mockDAI.address;
    await deployer.deploy(LoanShark, simpleNft.address, DAI, sablier.address);

    const loanShark = await LoanShark.deployed();

    const lender = accounts[0];
    const borrower = accounts[0];

    // KO
    await simpleNft.mintWithTokenURI(lender, 1, 'https://ipfs.infura.io/ipfs/QmV9QM5P5C3rPVMh8fL6FFnfzqqP5RvHDSZEiRdVZJPda3', {from: lender});
    // Kaiju
    await simpleNft.mintWithTokenURI(lender, 2, 'https://ipfs.infura.io/ipfs/QmP2cwq9muuTtzTKFuBN6xRRygVdfy2p124urPn1dQ8C9w', {from: lender});
    // Nifty
    await simpleNft.mintWithTokenURI(lender, 3, 'https://niftyfootball.cards/api/network/1/token/1', {from: lender});

    // Enable approval for all for the loan shark address
    await simpleNft.setApprovalForAll(loanShark.address, true);

    const now = Math.round(new Date().getTime() / 1000); // get seconds since unix epoch
    const startTime = now + 60; // 1 min from now
    const stopTime = now + 2592000 + 60; // 30 days and 1 min from now

    // first three tokens are put for loan
    await loanShark.enableTokenForLending(1, startTime, stopTime, deposit, {from: lender});
    await loanShark.enableTokenForLending(2, startTime, stopTime, deposit, {from: lender});
    await loanShark.enableTokenForLending(3, startTime, stopTime, deposit, {from: lender});

    // Next three tokens are minted to but not put on loan so we can defo that flow

    // KO
    await simpleNft.mintWithTokenURI(lender, 4, 'https://ipfs.infura.io/ipfs/QmdxMWDi6UiRBJPorWwSupRkebfmVggX554gfbULHomPvq', {from: lender});
    // BlockCities
    await simpleNft.mintWithTokenURI(lender, 5, 'https://us-central1-block-cities.cloudfunctions.net/api/network/1/token/2066', {from: lender});
    // Axie infinity
    await simpleNft.mintWithTokenURI(lender, 6, 'https://axieinfinity.com/api/axies/14514', {from: lender});

    // // Print out all tokens which have been put up for loan
    // const totalTokens = await loanShark.totalTokens();
    // // console.log('Total tokens', totalTokens);
    //
    // for (let i = 0; i < totalTokens; i++) {
    //     const tokenId = await loanShark.getTokenIdForIndex(i);
    //
    //     // console.log('Token ID', tokenId, i);
    //     const loanDetails = await loanShark.getLoanDetails(tokenId);
    //
    //     const {tokenUri} = loanDetails;
    //     // make http call - load tokenUri
    // }

    // await loanShark.borrowToken(1, {from: borrower});
    // await mockDAI.approve(loanShark.address, this.deposit, {from: bob});

    // set up one borrow
    mockDAI.approve(loanShark.address, deposit, {from: borrower});

    await loanShark.borrowToken(1, {from: borrower});

};
