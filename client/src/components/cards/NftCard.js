import React, { Component } from 'react'

import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  root: {
    width: 300,
    height: 500,
    margin: 20,
    fontFamily: 'Spartan',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    boxShadow: '3px 3px 5px 6px #ccc',
  },
  imageContainer: {
    minHeight: 100,
    maxHeight: 469,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    maxWidth: 250,
    maxHeight: 320,
    marginTop: 10,
  },
  borrowButton: {
    backgroundColor: '#5e6fe6',
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'lo',
    outline: 'none',
    border: 'none',
    borderRadius: 3,
    height: 34,
    width: 100,
    color: '#FFFFFF',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#bca049',
      color: '#000080'
    }
  },
  submitButton: {
    backgroundColor: '#b52114',
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'lo',
    outline: 'none',
    border: 'none',
    borderRadius: 3,
    height: 34,
    width: 100,
    color: '#FFFFFF',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#69120b',
    }
  },
}

class NftCard extends Component {

  state = {
    showShareForm: false
  }

  submitForm = event => {
    event.preventDefault()
  }

  showShareForm = () => {
    this.setState({
      showShareForm: true
    })
  }

  hideShareForm = () => {
    this.setState({
      showShareForm: false
    })
  }

  render() {
    const { classes, item = {} } = this.props

    return (
        <div className={classes.root}>
          {this.state.showShareForm ? (
            <>
              <CardContent>
                <div>Share your NFT by completing the details below</div>
                <form>
                  <label>Total price in DAI</label><input />
                  <label>Maximum loan duration in seconds</label><input />
                </form>
              </CardContent>
              <CardActions>
                <button className={classes.submitButton} onClick={event => this.submitForm(event)}>
                  Submit
                </button>
                  <button className={classes.borrowButton} onClick={this.hideShareForm}>
                    Cancel
                </button>
              </CardActions>
            </>) : (
            <>
              <div className={classes.imageContainer}>
                <img src={item.image} className={classes.image} />
              </div>
              <div className={classes.textGroup}>
                <CardContent>
                  <div className={classes.cardTitle}>
                    {item.name}
                  </div>
                </CardContent>
                <CardActions>
                  <button className={classes.borrowButton} onClick={this.showShareForm}>
                    Share
                  </button>
                </CardActions>
              </div>
            </>
            )}
        </div>
    )
  }
}

export default withStyles(styles)(NftCard)
