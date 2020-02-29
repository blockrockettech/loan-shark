import React from 'react'

import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Web3 from 'web3'

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
  textGroup: {

  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 20,
  },
  cardText: {
    maxHeight: 230,
    fontSize: 12,
    overflow: 'scroll',
    lineHeight: 1.25,
  },
  borrowButton: {
    backgroundColor: '#5e6fe6',
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'none',
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
  clawbackButton: {
    backgroundColor: '#b52114',
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'none',
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
  returnAssetButton: {
    backgroundColor: '#e60b10',
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'lo',
    outline: 'none',
    border: 'none',
    borderRadius: 3,
    height: 34,
    width: 280,
    color: '#FFFFFF',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#bc4b50',
      color: '#000080'
    }
  },
  cost: {
    fontWeight: 600,
  }
}


const date = (d) => `${new Date(d * 1000).toDateString()} ${new Date(d * 1000).toLocaleTimeString()}`

const shortAddress = (address) => {
 return `${address.substring(0, 6)}...${address.substring(address.length - 6, address.length)}`
}

const toDai = (value) => {
 return `$${Web3.utils.fromWei(value, 'ether')}`;
}

const LoandNft = props =>  {
  const { classes, item = {}, balance = 0, } = props
  const progress = 0 //(balance / depositAmount)
  console.log(item)
  return (
    <div className={classes.root}>
      <div className={classes.imageContainer}>
        <CircularProgress variant="static" value={progress} color="#f77725" />
        <img src={item.image} className={classes.image} />
      </div>
      <div className={classes.textGroup}>
        <CardContent>
          <div className={classes.cardTitle}>
            {item.name}
          </div>
          <div className={classes.cardText}>
            From: {date(item.start)} <br/>
            To: {date(item.end)}
            <br/>
            <br/>
            <span className={classes.cost}>⏳Streamed: {toDai(item.balance)}</span>
            <br />
            <br />
            Lender: {shortAddress(item.lender)} <br />
            Borrower: {shortAddress(item.borrower)}
          </div>
        </CardContent>
        <CardActions>
          <Button className={classes.returnAssetButton}>
            Return Asset
          </Button>
        </CardActions>
      </div>
    </div>
  )
}

export default withStyles(styles)(LoandNft)
