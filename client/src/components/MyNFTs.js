import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Switch from '@material-ui/core/Switch'

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
    backgroundColor: '#FFFFFF',
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

class MyNFTs extends Component {
  state = { 
    loanedNFTs: [],
    borrowedNFTs: [],
    checked: false,
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

  handleChange = () => {
    this.setState({
      ...this.state,
      checked: !this.state.checked
    })
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.myNFTs}>
        <div className={classes.toggle}>
          <span>Borrowing</span>
          <ToggleSwitch
            checked={this.state.checked}
            onChange={this.handleChange}
            value="checked"
          />
          <span>Lending</span>
        </div>
        <div className={classes.card}>
          {this.state.checked? (
            <div className={classes.subtitle}>
              Lending
            </div>
            ) : (
            <div className={classes.subtitle}>
              Borrowing
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(MyNFTs)

