const LoanShark = artifacts.require('./LoanShark.sol');
const SimpleNft = artifacts.require('./SimpleNft.sol');
const SablierMock = artifacts.require('./SablierMock.sol');

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(SimpleNft);
    const simpleNft = await SimpleNft.deployed();

    await deployer.deploy(SablierMock);
    const sablierMock = await SablierMock.deployed();

    const lender = accounts[0];

    await simpleNft.mintWithTokenURI(lender, 1, 'https://ipfs.infura.io/ipfs/QmV9QM5P5C3rPVMh8fL6FFnfzqqP5RvHDSZEiRdVZJPda3');
    await simpleNft.mintWithTokenURI(lender, 2, 'https://ipfs.infura.io/ipfs/QmP2cwq9muuTtzTKFuBN6xRRygVdfy2p124urPn1dQ8C9w');
    await simpleNft.mintWithTokenURI(lender, 3, 'https://niftyfootball.cards/api/network/1/token/1');

    await deployer.deploy(LoanShark, simpleNft.address, sablierMock.address);

    const loanShark = await LoanShark.deployed();

    await simpleNft.setApprovalForAll(loanShark.address, true);

    await loanShark.enableTokenForLending(1, 100000000, 100000);
    await loanShark.enableTokenForLending(2, 100000000, 100000);
    await loanShark.enableTokenForLending(3, 100000000, 100000);
    
    console.log(await loanShark.getLoanDetails(1));
    console.log(await loanShark.getLoanDetails(2));
    console.log(await loanShark.getLoanDetails(3));
};
