const LoanShark = artifacts.require('./LoanShark.sol');
const SimpleNft = artifacts.require('./SimpleNft.sol');
const MockDAI = artifacts.require('./MockDAI.sol');
const SablierMock = artifacts.require('./SablierMock.sol');

module.exports = async function (deployer, network, accounts) {
    // Deploy simple NFT
    await deployer.deploy(SimpleNft);
    const simpleNft = await SimpleNft.deployed();

    // Deploy fake DAI
    await deployer.deploy(MockDAI);
    const mockDAI = await MockDAI.deployed();

    // Give the first 3 accounts 10k in fake DAI
    await mockDAI.mint(accounts[0], '10000000000000000000000');
    await mockDAI.mint(accounts[1], '10000000000000000000000');
    await mockDAI.mint(accounts[2], '10000000000000000000000');

    // Deploy fake Sablier
    await deployer.deploy(SablierMock);
    const sablierMock = await SablierMock.deployed();

    const DAI = mockDAI.address;
    await deployer.deploy(LoanShark, simpleNft.address, DAI, sablierMock.address);

    const loanShark = await LoanShark.deployed();

    const lender = accounts[0];
    const borrower = accounts[1];

    // KO
    await simpleNft.mintWithTokenURI(lender, 1, 'https://ipfs.infura.io/ipfs/QmV9QM5P5C3rPVMh8fL6FFnfzqqP5RvHDSZEiRdVZJPda3', {from: lender});
    // Kaiju
    await simpleNft.mintWithTokenURI(lender, 2, 'https://ipfs.infura.io/ipfs/QmP2cwq9muuTtzTKFuBN6xRRygVdfy2p124urPn1dQ8C9w', {from: lender});
    // Nifty
    await simpleNft.mintWithTokenURI(lender, 3, 'https://niftyfootball.cards/api/network/1/token/1', {from: lender});

    // Enable approval for all for the loan shark address
    await simpleNft.setApprovalForAll(loanShark.address, true);

    // first three tokens are put for loan
    await loanShark.enableTokenForLending(1, 0, 100000000, 100000, {from: lender});
    await loanShark.enableTokenForLending(2, 0, 100000000, 100000, {from: lender});
    await loanShark.enableTokenForLending(3, 0, 100000000, 100000, {from: lender});

    // Next three tokens are minted to but not put on loan so we can defo that flow

    // KO
    await simpleNft.mintWithTokenURI(lender, 4, 'https://ipfs.infura.io/ipfs/QmdxMWDi6UiRBJPorWwSupRkebfmVggX554gfbULHomPvq', {from: lender});
    // BlockCities
    await simpleNft.mintWithTokenURI(lender, 5, 'https://us-central1-block-cities.cloudfunctions.net/api/network/1/token/2066', {from: lender});
    // Axie infinity
    await simpleNft.mintWithTokenURI(lender, 6, 'https://axieinfinity.com/api/axies/14514', {from: lender});

    // Print out all tokens which have been put up for loan
    const totalTokens = await loanShark.totalTokens();
    console.log('Total tokens', totalTokens);

    for (let i = 0; i < totalTokens; i++) {
        const tokenId = await loanShark.getTokenIdForIndex(i);
        console.log('Token ID', tokenId, i);

        const loanDetails = await loanShark.getLoanDetails(tokenId);
        console.log(loanDetails);

        const {tokenUri} = loanDetails;
        // make http call - load tokenUri
    }
};
