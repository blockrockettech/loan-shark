import React from 'react'

import CardContent from '@material-ui/core/CardContent'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';

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
  media: {
    height: 140,
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
    height: 50,
    width: 100,
    color: '#FFFFFF',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#bca049',
      color: '#000080'
    }
  },
}

const NftCard = props =>  {
  const { classes, item = {} } = props

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
          </CardContent>

          <CardActions>
            <Button className={classes.borrowButton}>
              $500 x 1 Day
            </Button>
            <Button className={classes.borrowButton}>
              $60 x 1hr
            </Button>
            <Button className={classes.borrowButton}>
              $10 x 10min
            </Button>
          </CardActions>
        </div>
      </div>
  )
}

export default withStyles(styles)(NftCard)
