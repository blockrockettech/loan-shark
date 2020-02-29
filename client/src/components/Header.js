import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Link } from "react-router-dom"

const styles = {
  header: {
    height: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'Spartan',
  },
  smalllogo: {
  },
  text: {
    fontSize: 72,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
  },
  link: {
    textDecoration: 'none',
    color: '#FFFFFF',
    margin: '5px 0'
  }
}

const Header = props => {
  const { classes } = props
  return (
    <div className={classes.header}>
      <div className={classes.smalllogo}>
        <Link className={classes.link} to="/">
          <img height="100" src="SharkIcon2.png" alt="smalllogo" />
        </Link>
      </div>
      <div className={classes.logo}><img src="/Loansharklogo.png" alt="logo" /></div>
      <div className={classes.menu}>
        <Link className={classes.link} to="/borrow">Borrow</Link>
        <Link className={classes.link} to="/loan">Loan</Link>
        <Link className={classes.link} to="/user">My NFTs</Link>
        <Link className={classes.link} to="/about">About</Link>
        <a className={classes.link} href="https://github.com/blockrockettech/loan-shark">Code</a>
      </div>
    </div>
  )
}

export default withStyles(styles)(Header)