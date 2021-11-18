import React, {useEffect} from 'react';

import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Paper from '@mui/material/Paper'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import {makeStyles} from '@material-ui/core/styles'

import AspectRatioBox from 'components/AspectRatioBox'
import CasesChart from 'components/CasesChart'
import VaccsChart from 'components/VaccsChart'
import useFetch from "../hooks/useFetch";
import {COUNTRY_LIST} from "../api/endpoints";

const tab_incidents = "Заболевамость"
const tab_vaccinations = "Вакцинации"


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


const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2, 0)
  },
  chartType: {
    margin: theme.spacing(1, 0)
  },
  button: {
    border: "1px solid",
    borderColor: theme.palette.primary.main,
    margin: theme.spacing(0, 1)
  },
}))

export default function Stats() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [countryIsoCode, setCountry] = React.useState(null);
  const classes = useStyles();

  const [countries, performCountriesFetch] = useFetch(COUNTRY_LIST)
  useEffect(() => {
    performCountriesFetch()
  }, [performCountriesFetch])

  if (!countries.data) {
    return (<div/>)
  }
  return (
    <Box className={classes.root}>
      <Box className={classes.chartType}>
        <Tabs value={currentTab} onChange={(e, newValue) => {
          setCurrentTab(newValue)
        }}>
          <Tab className={classes.button} variant="outlined" label={tab_incidents} id={0}/>
          <Tab className={classes.button} variant="outlined" label={tab_vaccinations} id={1}/>
        </Tabs>
        <Autocomplete
          id="country-select-demo"
          sx={{width: 300}}
          options={countries.data.data}
          autoHighlight
          getOptionLabel={(option) => option.location}
          renderOption={(props, option) => (
            <Box component="li"  {...props}>
              {option.location} ({option.iso_code})
            </Box>
          )}
          onChange={(event, newInputValue) => {
            setCountry(newInputValue ? newInputValue.iso_code : null);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Choose a country"
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password', // disable autocomplete and autofill
              }}
            />
          )}
        />
      </Box>

      <Paper>
        <AspectRatioBox ratio={16 / 8}>
          <TabPanel value={currentTab} index={0}>
            <CasesChart isoCode={countryIsoCode}/>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <VaccsChart/>
          </TabPanel>
        </AspectRatioBox>
      </Paper>
    </Box>
  )
}
