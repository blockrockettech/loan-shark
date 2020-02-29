import React, { Component } from "react"
import Onboard from 'bnc-onboard'
import Web3 from 'web3'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom"
import { withStyles } from '@material-ui/core/styles'

import Header from './components/Header'
import Marketplace from './components/Marketplace'
import MyNFTs from './components/MyNFTs'

const axios = require('axios')

const LoanShark = require('./contracts/LoanShark.json')

let web3

const styles = {
  app: {
    backgroundColor: '#5e6fe6',
    fontFamily: 'Spartan',
    minHeight: '100vh',
    padding: 40,
  },
  failMessage: {
    fontSize: 24,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  listItem: {
    margin: '10px 0',
  }
}

const onboard = Onboard({
  dappId: '09a2db78-5c6a-4dad-b5f7-218b278d0e55', // [String] The API key created by step one above
  networkId: 5777, // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    wallet: wallet => {
       web3 = new Web3(wallet.provider)
    }
  }
})

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    nftsForSale: [],
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance from Onboard.js
      await onboard.walletSelect()
      await onboard.walletCheck()

      const networkId = await web3.eth.net.getId()
      const deployedNetwork = LoanShark.networks[networkId]
      const instance = new web3.eth.Contract(
        LoanShark.abi,
        deployedNetwork && deployedNetwork.address,
      )
      this.setState({ web3, contract: instance })
      this.getNFTsForSale()
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      )
      console.error(error)
    }
  };

  getNFTsForSale = async() => {
    const { contract } = this.state
    const totalTokens = await contract.methods.totalTokens().call()
    const nftsForSale = []

    for (let i = 0; i < totalTokens; i++) {
      const tokenId = await contract.methods.getTokenIdForIndex(i).call()
      console.log(tokenId)
      const loanDetails = await contract.methods.getLoanDetails(tokenId).call()
      const tokenUri = await contract.methods.getPrincipleTokenUri(tokenId).call()
      const { data } = await axios.get(tokenUri)
      const nft = {
        ...data,
        ...loanDetails
      }
      nftsForSale.push(nft)
    }
    this.setState({
      ...this.state,
      nftsForSale
    })
  }

  render() {
    const { classes } = this.props
    console.log(this.state.nftsForSale)

    if (!this.state.web3) {
      return <div className={classes.app}><div className={classes.failMessage}>Please connect your Wallet to continue to Loan Shark</div></div>;
    }
    return (
      <Router>
        <Switch>
          {/*<Route exact path="/user">*/}
          {/*  <div className={classes.app}>*/}
          {/*    <Header />*/}
          {/*    */}
          {/*  </div>*/}
          {/*</Route>*/}
          <Route exact path="/borrow">
            <div className={classes.app}>
              <Header />
              <Marketplace />
            </div>
          </Route>
          <Route exact path="/loan">
            <div className={classes.app}>
              <Header />
              <MyNFTs />
            </div>
          </Route>
          <Route exact path="/about">
            <div className={classes.app}>
              <Header />
              Made at EthLondon 2020
            </div>
          </Route>
          <Route exact path="/">
            <div className={classes.app}>
              <Header />
              <ul>
                <li className={classes.listItem}>Loan Shark enables you to borrow and loan NFTs</li>
                <li className={classes.listItem}>ERC-721 compliant “wrapped NFT” which can be leased by owner via Sablier</li>
              </ul>
            </div>
          </Route>
        </Switch>
      </Router>
    )
  }
}

export default withStyles(styles)(App)

