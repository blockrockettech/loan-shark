import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import MediaCard from './MediaCard'

const testNFT = require('../testNFT.json')

const styles = {
  marketplace: {
    
  }
}

class Marketplace extends Component {
  state = { 
    NFTs: [testNFT]
  }

  componentDidMount = async () => {
    try {
      // Fetch NFTs
      // this.setState({ NFTs })
    } catch (error) {
      console.error(error)
    }
  }

  showMediaCards = () => {
    return this.state.NFTs.map(item => <MediaCard key={item.name} item={item} />)
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

