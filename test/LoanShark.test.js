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

        await this.simpleNft.mintWithTokenURI(alice, TOKEN_ID_ONE, 'abc', {from: alice}); // Token ID 1
        (await this.simpleNft.balanceOf(alice)).should.be.bignumber.equal('1');

        this.nowThen = await time.latest();

        // approve the shark to pull in the NFT in escrow
        await this.simpleNft.approve(this.loanShark.address, TOKEN_ID_ONE, {from: alice});

        this.deposit = new BN("2999999999999998944000"); // almost 3,000, but not quite

        // give bob some dough...
        await this.mockDai.mint(bob, this.deposit);

        this.nowThen = await time.latest();
        this.startTime = this.nowThen.add(new BN('3600')); // 1 hour from now
        this.stopTime = this.startTime.add(new BN('2592000')); // 30 days and 1 hour from now
    });

    describe('LoanShark enable loan', function () {
        it("assert can enableTokenForLending", async function () {
            await this.loanShark.enableTokenForLending(TOKEN_ID_ONE, this.nowThen, this.nowThen.add(new BN('3600')), ONE_DAI, {from: alice});

            (await this.loanShark.totalTokens()).should.be.bignumber.equal('1');

            const loanOffer = await this.loanShark.tokensAvailableToLoan(TOKEN_ID_ONE);
            loanOffer.lender.should.be.equal(alice);
            loanOffer.borrower.should.be.equal('0x0000000000000000000000000000000000000000');
            loanOffer.tokenId.should.be.bignumber.equal('1');
            loanOffer.isEscrowed.should.be.equal(true);
            loanOffer.isBorrowed.should.be.equal(false);
            loanOffer.depositInWei.should.be.bignumber.equal(ONE_DAI);
        });
    });

    describe('LoanShark borrow loan', function () {
        it("assert can borrowToken and see balance increase over time", async function () {

            await this.loanShark.enableTokenForLending(TOKEN_ID_ONE, this.startTime, this.stopTime, this.deposit, {from: alice});
            (await this.loanShark.totalTokens()).should.be.bignumber.equal('1');

            // allow the shark to escrow
            this.mockDai.approve(this.loanShark.address, this.deposit, {from: bob});

            await this.loanShark.borrowToken(TOKEN_ID_ONE, {from: bob});

            // two mins
            for (let i = 0; i < 120; i++) {
                await time.increaseTo(this.startTime.add(new BN(i.toString())));

                let bal = await this.loanShark.getRemainingStreamBalance.call(TOKEN_ID_ONE, {from: alice});
                console.log(web3.utils.fromWei(bal.toString()));
            }
        });

        it("assert can borrowToken and see withdraw from the stream", async function () {

            await this.loanShark.enableTokenForLending(TOKEN_ID_ONE, this.startTime, this.stopTime, this.deposit, {from: alice});
            (await this.loanShark.totalTokens()).should.be.bignumber.equal('1');

            // allow the shark to escrow
            this.mockDai.approve(this.loanShark.address, this.deposit, {from: bob});

            await this.loanShark.borrowToken(TOKEN_ID_ONE, {from: bob});

            // 1 min
            await time.increaseTo(this.startTime.add(new BN(3600)));

            let bal = await this.loanShark.getRemainingStreamBalance.call(TOKEN_ID_ONE, {from: alice});
            console.log(web3.utils.fromWei(bal.toString()));
        });
    });
});