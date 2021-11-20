import React from 'react';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import AspectRatioBox from 'components/AspectRatioBox';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2, 0)
  },
  box: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  errorWrapper: {
    display: "flex",
    alignItems: "center",
  },
  errorMessage: {
    margin: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  divider: {
    width: "1px",
    height: "100%",
    backgroundColor: theme.palette.text.secondary
  }
}))

const NotFound = () => {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <AspectRatioBox ratio={16/9}>
        <Box className={classes.box}>

          <Box className={classes.errorWrapper}>
            <Typography sx={{m: 1, fontWeight: 800, fontSize: "10rem"}}>404</Typography>
            <Box className={classes.divider}/>
            <Box className={classes.errorMessage}>
              <Typography sx={{fontWeight: 400, fontSize: "4rem"}}>Беда!</Typography>
              <Typography sx={{fontWeight: 300, fontSize: "1.5rem"}}>Страница не найдена :(</Typography>
              <Box>
                <Link to="/" style={{display: "flex", alignItems: "center"}}>
                  <ChevronLeftIcon />
                  <Typography sx={{fontWeight: 300, fontSize: "1.5rem"}}>На главную</Typography>
                </Link>
              </Box>
            </Box>
          </Box>

        </Box>
      </AspectRatioBox>
    </Paper>
  )
}

export default NotFound
