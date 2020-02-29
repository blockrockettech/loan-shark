import React, { Component } from "react"
// import { connect } from 'react-redux'
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
  content: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  title: {
    fontWeight: 700,
    // marginBottom: 20
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    margin: '20px 0',
  },
  listItem: {
    margin: '10px 0',
  },
  intro: {
    marginTop: 20,
    fontSize: 48,
    fontWeight: 500
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
  }

  componentDidMount = async () => {

    try {
      // Get network provider and web3 instance from Onboard.js
      await onboard.walletSelect()
      await onboard.walletCheck()
      this.setState({ web3 })
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      )
      console.error(error)
    }
  };

  render() {
    const { classes } = this.props
    // if (!this.props.web3) {
    if (!this.state.web3) {
      return <div className={classes.app}><div className={classes.failMessage}>Please connect your Wallet to continue to Loan Shark</div></div>;
    }
    return (
      <Router>
        <Switch>
          <Route exact path="/active">
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
              Made at EthLondon 2020 by:
              <ul >
                <li className={classes.listItem}>Andy Gray and James Morgan, representing BlockRocket Tech</li>
                <li className={classes.listItem}>Holly Atkinson</li>
                <li className={classes.listItem}>Oliver Carding of CryptoKaiju</li>
              </ul>
            </div>
          </Route>
          <Route exact path="/">
            <div className={classes.app}>
              <Header />
              
              <div className={classes.content}>
                <div className={classes.intro}>How does it work?</div>
                <div className={classes.list}>
                  <div className={classes.title}>Key features:</div>
                  <ul >
                    <li className={classes.listItem}>LoanShark blends NFTs with DeFi to enable temporary sharing of NFTs</li>
                    <li className={classes.listItem}>Make money by leasing NFTs, while borrowing others you like!</li>
                    <li className={classes.listItem}>Uses an ERC-721 compliant “wrapped NFT” contract which enables leasing via Sablier</li>
                    <li className={classes.listItem}>LoanShark consumes any given NFT, proxying through all methods of the original NFT</li>
                    <li className={classes.listItem}>And don't worry, the shark always retains full ownership of their asset</li>
                    <li className={classes.listItem}>Leverages OpenZeppelin token standards such as ERC-20 and EIP-721</li>
                    <li className={classes.listItem}>Built on top Sablier's payment stream EIP-1620 and harnesses DAI as the payment token of choice</li>                  </ul>
                </div>
                <video controls width="750">
                  <source src="/LoansharkexplainerAmended.mp4" />
                  Sorry, your browser doesn't support embedded videos.
                </video>
                
              </div>
            </div>
          </Route>
        </Switch>
      </Router>
    )
  }
}

export default withStyles(styles)(App)

