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
    display: 'flex',
    alignItems: 'center'
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
        <img height="50" src="https://camo.githubusercontent.com/e4a40ffa9d4c7c037871862dbf0d1ae8a6f307ee/68747470733a2f2f692e696d6775722e636f6d2f713655485474312e706e67" alt="sablierlogo" />
        <img height="50" src="https://sfo2.digitaloceanspaces.com/engamb/wp-content/uploads/2019/10/09141745/NEW-dai-logo-e1570610882413.png" alt="dailogo" />
      </div>
      <div className={classes.logo}><img src="/Loansharklogo.png" alt="logo" /></div>
      <div className={classes.menu}>
        <Link className={classes.link} to="/active">All Active 💸</Link>
        <Link className={classes.link} to="/loan">My Account 🦄</Link>
        <Link className={classes.link} to="/about">About 🦈</Link>
        <a className={classes.link} href="https://github.com/blockrockettech/loan-shark">Code 🌶️</a>
      </div>
    </div>
  )
}

export default withStyles(styles)(Header)
