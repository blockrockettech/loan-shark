const {BN, expectRevert, expectEvent, constants, time} = require('@openzeppelin/test-helpers');
const {ZERO_ADDRESS} = constants;
require('chai').should();

const LoanShark = artifacts.require("./LoanShark.sol");
const SimpleNft = artifacts.require("./SimpleNft.sol");
const MockDai = artifacts.require("./MockDai.sol");
const Sablier = artifacts.require("./Sablier.sol");

contract("LoanShark tests", function ([creator, alice, bob, ...accounts]) {

    const toEthBN = function (ethVal) {
        return new BN(web3.utils.toWei(ethVal, 'ether').toString());
    };

    const ZERO = new BN('0');
    const TOKEN_ID_ONE = new BN('1');

    const ONE_DAI = toEthBN('1');

    beforeEach(async function () {
        this.simpleNft = await SimpleNft.new({from: creator});
        this.mockDai = await MockDai.new({from: creator});
        this.sablier = await Sablier.new({from: creator});

        this.loanShark = await LoanShark.new(
            this.simpleNft.address,
            this.mockDai.address,
            this.sablier.address,
            {from: creator}
        );

        console.log(`release the shark: ${this.loanShark.address}`);
    });

    describe('LoanShark enable loan', function () {
        it("assert can enableTokenForLending", async function () {
            await this.simpleNft.mintWithTokenURI(alice, TOKEN_ID_ONE, 'abc', {from: alice}); // Token ID 1
            (await this.simpleNft.balanceOf(alice)).should.be.bignumber.equal('1');

            const nowThen = await time.latest();

            // approve the shark to pull in the NFT in escrow
            await this.simpleNft.approve(this.loanShark.address, TOKEN_ID_ONE, {from: alice});

            await this.loanShark.enableTokenForLending(TOKEN_ID_ONE, nowThen, nowThen.add(new BN('3600')), ONE_DAI, {from: alice});

            (await this.loanShark.totalTokens()).should.be.bignumber.equal('1');

            const loanOffer = await this.loanShark.tokensAvailableToLoan(TOKEN_ID_ONE);
            loanOffer.lender.should.be.equal(alice);
            loanOffer.tokenId.should.be.bignumber.equal('1');
            loanOffer.isEscrowed.should.be.equal(true);
            loanOffer.isBorrowed.should.be.equal(false);
            loanOffer.depositInWei.should.be.bignumber.equal(ONE_DAI);
        });
    });
});