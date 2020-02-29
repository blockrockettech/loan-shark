import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  myNFTs: {
    backgroundColor: '#FFFFFF',
  }
}

class MyNFTs extends Component {
  state = { 
    loanedNFTs: [],
    borrowedNFTs: [],
  }

  componentDidMount = async () => {
    try {
      // Fetch NFTs
      // this.setState({ 
      //   loanedNFTs,
      //   borrowedNFTs
      // })
    } catch (error) {
      console.error(error)
    }
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.myNFTs}>
        <div className={classes.toggle}>
          Toggle
        </div>
        <div className={classes.card}>
          <div>
            Lending
          </div>
          <div>
            Borrowing
          </div>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(MyNFTs)
