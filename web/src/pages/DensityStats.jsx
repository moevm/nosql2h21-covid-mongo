import React from 'react';

import {makeStyles} from '@material-ui/core/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

import { formatISO } from 'date-fns';

import AspectRatioBox from 'components/AspectRatioBox';
import DateRangeInput from 'components/ComplexInput/DateRangeInput';

const objectDiff = (object1, object2) => Object.keys(object2).reduce((diff, key) => {
  if (object1[key] === object2[key]) return diff
  return {
    ...diff,
    [key]: object1[key]
  }
}, {})


const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2, 0),
  },
  toolsBottom: {
    margin: theme.spacing(2, 0),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
}))

const DensityStats = () => {
  const [stateHistory, setStateHistory] = React.useState({
    past: [],
    present: {dateFrom: null, dateTo: null},
    future: []
  });

  const classes = useStyles();

  const dispatch = (state) => {
    setStateHistory(stateHistory => {
      const changedStatePart = objectDiff(stateHistory.present, state);
      const newState = {...stateHistory.present, ...state};
      return {
        past: stateHistory.past.concat(changedStatePart),
        present: newState,
        future: []
      }
    })
  }

  const undo = () => {
    if(stateHistory.past.length === 0) {
      return
    }

    setStateHistory(stateHistory => {
      const lastDiff = stateHistory.past[stateHistory.past.length - 1]
      const changedStatePart = objectDiff(stateHistory.present, lastDiff);
      const newState = {...stateHistory.present, ...lastDiff}
      return {
        past: stateHistory.past.slice(0, -1),
        present: newState,
        future: stateHistory.future.concat(changedStatePart)
      }
    })
  }

  const redo = () => {
    if(stateHistory.future.length === 0) {
      return
    }

    setStateHistory(stateHistory => {
      const futureDiff = stateHistory.future[stateHistory.future.length - 1]
      const changedStatePart = objectDiff(stateHistory.present, futureDiff);
      const newState = {...stateHistory.present, ...futureDiff}
      return {
        past: stateHistory.past.concat(changedStatePart),
        present: newState,
        future: stateHistory.future.slice(0, -1)
      }
    })
  }

  const onDateSelect = (date) => {
    dispatch({...date})
  }

  return (
    <Box className={classes.root}>
      <Paper>
        <AspectRatioBox ratio={16 / 8}>
          {/* { (stateHistory.present.country1 && stateHistory.present.country2)
            ? (pairedCases.loading) || (!(pairedCases.data) && !(pairedCases.error))
              ? loading()
              : (pairedCases.error)
                ? error(pairedCases.error?.message)
                : chart(pairedCases.data)
            : <Box sx={{display: "flex", width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
              <Typography variant="h6" component="div">Выберите обе страны</Typography>
            </Box>
          } */}
        </AspectRatioBox>
      </Paper>

      <Box className={classes.toolsBottom}>
        <Box>
          <DateRangeInput
            value={{
              dateFrom: stateHistory.present.dateFrom,
              dateTo: stateHistory.present.dateTo
            }}
            onChange={onDateSelect}
          />
        </Box>
        
        <Box sx={{display: "flex"}}>
          <Tooltip title="undo">
            <span>
              <IconButton size="large" onClick={()=>{undo()}} disabled={stateHistory.past.length === 0}>
                <UndoIcon fontSize="large"/>
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="redo">
            <span>
              <IconButton size="large" onClick={()=>{redo()}} disabled={stateHistory.future.length === 0}>
                <RedoIcon fontSize="large"/>
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}

export default DensityStats
