import React from 'react'

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography';

import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

import {makeStyles} from '@material-ui/core/styles';
import { formatISO } from 'date-fns';

import AspectRatioBox from 'components/AspectRatioBox';
import CountrySelect from 'components/CountrySelect';
import DateRangeInput from 'components/ComplexInput/DateRangeInput';
import CasesComparisonChart from 'components/CasesComarisonChart';

import useFetch from 'hooks/useFetch';
import {CASES_PER_DAY_COMP} from 'api/endpoints';


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
  toolsTop: {
    margin: theme.spacing(2, 0),
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  toolsBottom: {
    margin: theme.spacing(2, 0),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
}))

const StatsCompare = () => {
  // const [cases1, performCases1Fetch] = useFetch(CASES_PER_DAY)
  // const [cases2, performCases2Fetch] = useFetch(CASES_PER_DAY_EXTRA)

  const [pairedCases, performFetch] = useFetch(CASES_PER_DAY_COMP);

  const [stateHistory, setStateHistory] = React.useState({
    past: [],
    present: {country1: null, country2: null, dateFrom: null, dateTo: null},
    future: []
  });

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

  React.useEffect(() => {
    const isoCode1 = stateHistory.present.country1?.iso_code;
    const isoCode2 = stateHistory.present.country2?.iso_code;
    const dateFrom = stateHistory.present.dateFrom;
    const dateTo = stateHistory.present.dateTo;

    if (isoCode1 && isoCode2) {
      performFetch({
        iso_code: `${isoCode1}|${isoCode2}`,
        date_from: dateFrom && formatISO(dateFrom, {representation: "date"}),
        date_to: dateTo && formatISO(dateTo, {representation: "date"})
      })
    }

  }, [performFetch, stateHistory])

  const classes = useStyles();


  const onCountrySelect = (countryField, countryObj) => {
    dispatch({[countryField]: countryObj})
  }

  const onDateSelect = (date) => {
    dispatch({...date})
  }

  const loading = () => (
    <Box sx={{display: "flex", width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
      <CircularProgress size="5rem"/>
    </Box>
  )

  const error = (message1, message2) => (
    <Box sx={{
      display: "flex",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <SentimentVeryDissatisfiedIcon color="primary" style={{width: "10rem", height: "10rem"}}/>
      <Typography variant="h6">{message1}</Typography>
      <Typography variant="h6">{message2}</Typography>
    </Box>
  )

  const chart = (response1, response2) => 
  {
    return (
      <CasesComparisonChart
        data1={response1.data}
        data2={response2.data}
        country1={stateHistory.present.country1?.iso_code || "World"}
        country2={stateHistory.present.country2?.iso_code || "World"}
        label="new cases"
        smoothedLabel="7-day avg"
        color1="#FF9900"
        color2="#0000FF"
      />
    )
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.toolsTop}>
        <CountrySelect value={stateHistory.present.country1} label="Выбор первой страны" onChange={(country) => {onCountrySelect("country1", country)}}/>
        <CountrySelect value={stateHistory.present.country2} label="Выбор второй страны" onChange={(country) => {onCountrySelect("country2", country)}}/>
      </Box>

      <Paper>
        <AspectRatioBox ratio={16 / 8}>
          { (stateHistory.present.country1 && stateHistory.present.country2)
            ? (pairedCases.loading) || (!(pairedCases.data) && !(pairedCases.error))
              ? loading()
              : (pairedCases.error)
                ? error(pairedCases.error?.message)
                : chart(pairedCases.data)
            : <Box sx={{display: "flex", width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
              <Typography variant="h6" component="div">Выберите обе страны</Typography>
            </Box>
          }
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

export default StatsCompare
