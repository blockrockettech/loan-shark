import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Onboard from 'bnc-onboard';
import Web3 from 'web3';
import LoandNft from './cards/LoandNft';

const axios = require('axios')

const LoanShark = require('../contracts/LoanShark.json')

const styles = {
  marketplace: {

  }
}

let web3;

const onboard = Onboard({
  dappId: '09a2db78-5c6a-4dad-b5f7-218b278d0e55', // [String] The API key created by step one above
  networkId: 5777, // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    wallet: wallet => {
      web3 = new Web3(wallet.provider)
    }
  }
})

class Marketplace extends Component {
  state = {
    web3: null,
    account: null,
    contract: null,
    nftsForSale: [],
  }

  timer = null;

  componentDidMount = async () => {
    try {
      const account = (await web3.eth.getAccounts())[0]
      const networkId = await web3.eth.net.getId()
      const deployedNetwork = LoanShark.networks[networkId]
      const instance = new web3.eth.Contract(
          LoanShark.abi,
          deployedNetwork && deployedNetwork.address,
      )

      this.setState({ web3, contract: instance, account })

      this.getNFTsForSale()
      this.timer = setInterval(() =>{
          this.getNFTsForSale()
      },3000)

    } catch (error) {
      console.error(error)
    }
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  getNFTsForSale = async() => {
    // const { contract } = this.props
    const { contract } = this.state
    const totalTokens = await contract.methods.totalTokens().call()
    const nftsForSale = []

    for (let i = 0; i < totalTokens; i++) {
      const tokenId = await contract.methods.getTokenIdForIndex(i).call()
      const loanDetails = await contract.methods.getLoanDetails(tokenId).call()
      if (loanDetails.isBorrowed) {
        const tokenUri = await contract.methods.getPrincipleTokenUri(tokenId).call()
        const balance = await contract.methods.getRemainingStreamBalance(tokenId).call()
        const { data } = await axios.get(tokenUri)
        const nft = {
          ...data,
          ...loanDetails,
          balance,
          tokenId
        };
        nftsForSale.push(nft)
      }
      console.log("Loaded for sale NFTs", nftsForSale)
    }
    this.setState({ nftsForSale })
  }

  onReturnAssetClick = async (item) => {
    console.log("onReturnAssetClick", item)
    const { contract, account } = this.state
    await contract.methods.returnBorrowedNft(item.tokenId).send({from: account})
  }

  showMediaCards = () => {
    return this.state.nftsForSale.map(item => <LoandNft key={item.name} item={item} onReturnAssetClicked={this.onReturnAssetClick}/>)
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.marketplace}>
        {this.showMediaCards()}
      </div>
    )
  }
}

export default withStyles(styles)(Marketplace)

