import React from 'react';

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

import {makeStyles} from '@material-ui/core/styles';

import AspectRatioBox from 'components/AspectRatioBox';
import CasesChart from 'components/CasesChart';
import VaccsChart from 'components/VaccsChart';
import CountrySelect from 'components/CountrySelect';
import DateSelect from 'components/ComplexInput/DateRangeInput';

const tab_incidents = "Заболевамость";
const tab_vaccinations = "Вакцинации";


function TabPanel({children, value, index, ...other}) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
      {value === index && (
        <Box sx={{width: "100%", height: "100%"}}>
          {children}
        </Box>
      )}
    </div>
  )
}

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
  tools: {
    margin: theme.spacing(2, 0),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
}))

export default function Stats() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [stateHistory, setStateHistory] = React.useState({
    past: [],
    present: {country: null, dateFrom: null, dateTo: null},
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

  window.stateHistory = stateHistory
  window.undo = undo
  window.redo = redo

  const onCountrySelect = (country) => {
    dispatch({country});
  }

  const onDateSelect = (date) => {
    dispatch({...date})
  }

  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.tools}>
        <Tabs value={currentTab} onChange={(e, newValue) => {
          setCurrentTab(newValue)
        }}>
          <Tab className={classes.button} variant="outlined" label={tab_incidents} id={0}/>
          <Tab className={classes.button} variant="outlined" label={tab_vaccinations} id={1}/>
        </Tabs>
        <CountrySelect value={stateHistory.present.country} onChange={onCountrySelect}/>
      </Box>

      <Paper>
        <AspectRatioBox ratio={16 / 8}>
          <TabPanel value={currentTab} index={0}>
            <CasesChart
              isoCode={stateHistory.present.country?.iso_code}
              dateFrom={stateHistory.present.dateFrom}
              dateTo={stateHistory.present.dateTo}
            />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <VaccsChart
              isoCode={stateHistory.present.country?.iso_code}
              dateFrom={stateHistory.present.dateFrom}
              dateTo={stateHistory.present.dateTo}
            />
          </TabPanel>
        </AspectRatioBox>
      </Paper>

      <Box className={classes.tools}>
        <Box>
          <DateSelect
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
