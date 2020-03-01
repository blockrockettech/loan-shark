import React from 'react'

import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Web3 from 'web3';
import moment from 'moment';

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
    // marginBottom: 20,
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
    width: 280,
    color: '#FFFFFF',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#bca049',
      color: '#000080'
    }
  },
  disabledButton: {
    backgroundColor: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'none',
    outline: 'none',
    borderRadius: 3,
    height: 34,
    width: 280,
    color: '#000000',
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #000000'
  },
  imageContainer: {
    minHeight: 100,
    maxHeight: 469,
    height: 340,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    maxWidth: 250,
    maxHeight: 310,
    marginTop: 10,
  },
}

const toDai = (value) => {
  return `$${parseFloat(Web3.utils.fromWei(value.toString(), 'ether')).toFixed(2)}`;
}

const diffInDays = (start, end) => {
  return `${moment.duration(moment.unix(end).diff(moment.unix(start))).asDays()} days`
}

const costPerDay = (start, end, depositInWei) => {
  let days = moment.duration(moment.unix(end).diff(moment.unix(start))).asDays();
  return depositInWei / days;
}

const shortAddress = (address) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 6, address.length)}`
}

const ForLoanNftCard = props =>  {
  const {
    classes,
    item = {} ,
    onBorrowClicked = (item) => {},
    onClawbackClicked = (item) => {},
  } = props

  return (
    <div className={classes.root}>

      <div className={classes.imageContainer}>
        <img src={item.image} className={classes.image} />
      </div>
      <div className={classes.textGroup}>
        <CardContent>
          <div className={classes.cardTitle}>
            {item.name}
          </div>
          <div className={classes.cardText}>
            {/*Cost: {toDai(item.depositInWei)}*/}
            {/*<br />*/}
            <p>⏳ Length: <strong>{diffInDays(item.start, item.end)}</strong></p>
            <p>💸 Cost per day: <strong>{toDai(costPerDay(item.start, item.end, item.depositInWei))}</strong></p>
            👤 Lender: {shortAddress(item.lender)}
          </div>
        </CardContent>

        <CardActions>
          {!item.isBorrowed ?
          <button className={classes.borrowButton} onClick={() => onBorrowClicked(item)}>
            Borrow
          </button>
              :
              <div className={classes.disabledButton}>
                On loan: {shortAddress(item.borrower)}
              </div>
          }
        </CardActions>
      </div>
    </div>
  )
}

export default withStyles(styles)(ForLoanNftCard)
