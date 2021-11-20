import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const useStyles = makeStyles((theme) => ({
  toolbarContainer: {
    display: "flex!important",
    alignItems: "center",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1)
  }
}))

const Header = ({title="Title", children}) => {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const handleOpen = () => {setOpen(true)};
  const handleClose = () => {setOpen(false)};

  return (
    <>
      <AppBar position="relative">
        <Toolbar>
          <Container className={classes.toolbarContainer}>
            <CoronavirusIcon fontSize="large"/>
            <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
              {title}
            </Typography>
          </Container>
          
          <IconButton color="inherit" aria-label="open menu" onClick={handleOpen} edge="start" sx={{mr: 2}}>
            <MenuIcon fontSize="large"/>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer variant="temporary" open={open} onClose={handleClose} anchor="right">
        <Box className={classes.drawerHeader}>
          <IconButton onClick={handleClose}>
            <ChevronRightIcon fontSize="large"/>
          </IconButton>
        </Box>
        <Divider/>
        {children}
      </Drawer>
    </>
  )
}

export default Header
