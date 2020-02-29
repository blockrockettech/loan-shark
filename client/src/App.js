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
  networkId: 3, // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    wallet: wallet => {
       web3 = new Web3(wallet.provider)
    }
  }
})

class App extends Component {
  state = { web3: null, accounts: null, contract: null }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance from Onboard.js
      await onboard.walletSelect()
      await onboard.walletCheck()

      // Use web3 to get the user's accounts.
      // const accounts = await web3.eth.getAccounts()

      // Get the contract instance.
      // const networkId = await web3.eth.net.getId()
      // const deployedNetwork = SimpleStorageContract.networks[networkId];
      // const instance = new web3.eth.Contract(
      //   SimpleStorageContract.abi,
      //   deployedNetwork && deployedNetwork.address,
      // );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3 })
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error)
    }
  };

  // runExample = async () => {
  //   const { accounts, contract } = this.state;

  //   // Stores a given value, 5 by default.
  //   await contract.methods.set(5).send({ from: accounts[0] });

  //   // Get the value from the contract to prove it worked.
  //   const response = await contract.methods.get().call();

  //   // Update state with the result.
  //   this.setState({ storageValue: response });
  // };

  render() {
    const { classes } = this.props

    if (!this.state.web3) {
      return <div className={classes.app}><div className={classes.failMessage}>Please connect your Wallet to continue to Loan Shark</div></div>;
    }
    return (
      <Router>
        <Switch>
          <Route exact path="/user">
            <div className={classes.app}>
              <Header />
              <MyNFTs />
            </div>
          </Route>
          <Route exact path="/marketplace">
            <div className={classes.app}>
              <Header />
              <Marketplace />
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
                <li className={classes.listItem}>ERC20-compliant wrapped NFT mechanism enables token streaming via Sablier</li>
              </ul>
            </div>
          </Route>
        </Switch>
      </Router>
    )
  }
}

export default withStyles(styles)(App)
