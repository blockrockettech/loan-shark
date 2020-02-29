import React from 'react'

import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';

const styles = {
  root: {
    maxWidth: 345,
    maxHeight: 500,
  },
  media: {
    height: 140,
  },
}

const NftCard = props =>  {
  const { classes, item = {} } = props

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
        </CardContent>  
      </CardActionArea>
      <CardActions>

        <Button size="small" color="primary">
          Set Terms
        </Button>
      </CardActions>
    </Card>
  )
}

export default withStyles(styles)(NftCard)
