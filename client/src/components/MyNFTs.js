import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Switch from '@material-ui/core/Switch'
import Web3 from 'web3'
import Onboard from 'bnc-onboard';
import NftCard from './cards/NftCard';
import ForLoanNftCard from './cards/ForLoanNftCard';

const SimpleNft = require('../contracts/SimpleNft.json')
const LoanShark = require('../contracts/LoanShark.json')

const axios = require('axios')

const styles = {
  myNFTs: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  toggle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '40px 0',
  },
  card: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 6,
  },
  subtitle: {
    fontSize: 24,
  },
}

const ToggleSwitch = withStyles({
  switchBase: {
    color: '#000080',
    '&$checked': {
      color: '#f5bf05',
    },
    '&$checked + $track': {
      backgroundColor: '#ffffff',
    },
  },
  checked: {},
  track: {},
})(Switch);

let web3

const onboard
    = Onboard({
  dappId: '09a2db78-5c6a-4dad-b5f7-218b278d0e55', // [String] The API key created by step one above
  networkId: 5777, // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    wallet: wallet => {
      web3 = new Web3(wallet.provider)
    }
  }
})

class MyNFTs extends Component {
  state = {
    showLendingToggle: false,
    web3: null,
    account: null,
    simpleNftContract: null,
    loanSharkContract: null,
    tokensOfOwner: [],
    myNfts: [],
    nftsForSale: []
  }

  componentDidMount = async () => {
    try {
      const account = (await web3.eth.getAccounts())[0]
      const networkId = await web3.eth.net.getId()
      const simpleNftContract = new web3.eth.Contract(
          SimpleNft.abi,
          SimpleNft.networks[networkId].address,
      )
      const loanSharkContract = new web3.eth.Contract(
          LoanShark.abi,
          LoanShark.networks[networkId].address,
      )
      this.setState({ web3, simpleNftContract, loanSharkContract, account })
      this.getMyNfts()
    } catch (error) {
      alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
      )
      console.error(error)
    }
  }

  getMyNfts = async() => {
    const { simpleNftContract, loanSharkContract, account } = this.state
    const tokensOfOwner = await simpleNftContract.methods.tokensOfOwner(account).call()
    console.log("tokensOfOwner", tokensOfOwner);

    const myNfts = await Promise.all(tokensOfOwner.map(async (tokenId) => {
      const tokenUri = await simpleNftContract.methods.tokenURI(tokenId).call()
      const { data } = await axios.get(tokenUri)
      return {
        ...data,
        tokenId,
        account
      };
    }))

    const tokenIds = await loanSharkContract.methods.getTokensLenderIsBorrowing(account).call()

    const nftsForSale = await Promise.all(tokenIds.map(async (tokenId) => {
      const loanDetails = await loanSharkContract.methods.getLoanDetails(tokenId).call()
      const tokenUri = await simpleNftContract.methods.tokenURI(tokenId).call()
      const { data } = await axios.get(tokenUri)
      return {
        ...data,
        tokenId,
        ...loanDetails
      }
    }))

    console.log("NFTS I own", myNfts);
    console.log("NFTS I've put up for borrowing", nftsForSale);

    this.setState({
      ...this.state,
      tokensOfOwner,
      myNfts,
      nftsForSale
    })
  }

  handleChange = () => {
    this.setState({
      ...this.state,
      showLendingToggle: !this.state.showLendingToggle
    })
  }

  onBorrowClick = async (item) => {
    console.log("onBorrowClick", item)
    const { loanSharkContract, account } = this.state
    await loanSharkContract.methods.borrowToken(item.tokenId).send({from: account})
  }

  onClawbackClick = async (item) => {
    console.log("onClawbackClick", item)
    const { loanSharkContract, account } = this.state
    await loanSharkContract.methods.clawBackNft(item.tokenId).send({from: account})
  }

  buildMyNftCards = () => {
    return this.state.myNfts.map(item => <NftCard key={item.tokenId} item={item} />)
  }

  buildCardsForSale = () => {
    return this.state.nftsForSale.map(item => <ForLoanNftCard key={item.tokenId} item={item}
                                                              onBorrowClicked={this.onBorrowClick}
                                                              onClawbackClicked={this.onClawbackClick} />)
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.myNFTs}>
        <div className={classes.toggle}>
          <span>NFTs For Loan</span>
          <ToggleSwitch
            checked={this.state.showLendingToggle}
            onChange={this.handleChange}
            value="checked"
          />
          <span>Other NFTs</span>
        </div>
        <div className={classes.card}>
          {this.state.showLendingToggle?
              this.buildMyNftCards()
            :
              this.buildCardsForSale()
          }
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(MyNFTs)

