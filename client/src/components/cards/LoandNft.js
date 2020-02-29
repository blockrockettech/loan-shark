import React from 'react'

import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Web3 from 'web3'

const styles = {
  root: {
    maxWidth: 345,
    maxHeight: 500,
  },
  media: {
    height: 140,
  },
}

const date = (d) => `${new Date(d * 1000).toDateString()} ${new Date(d * 1000).toLocaleTimeString()}`

const shortAddress = (address) => {
 return `${address.substring(0, 6)}...${address.substring(address.length - 6, address.length)}`;
}

const toDai = (value) => {
 return `$${Web3.utils.fromWei(value, 'ether')}`;
}

const LoandNft = props =>  {
  const { classes, item = {}, balance = 0, } = props


  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image={item.image}
          title={item.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {item.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {item.price}
            {item.duration}
            {/*{item.description}*/}
          </Typography>
            <Typography variant="body2" color="textPrimary" component="p">
                From: {date(item.start)} <br/>
                To: {date(item.end)}
                <br/>
                <br/>
                Total charged: {toDai(item.balance)}
                <br />
                <br />
                Lender: {shortAddress(item.lender)} <br />
                Borrower: {shortAddress(item.borrower)}
            </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>


      </CardActions>
    </Card>
  )
}

export default withStyles(styles)(LoandNft)
