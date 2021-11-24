import React from 'react'

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

import ReplayIcon from '@mui/icons-material/Replay';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';

import { makeStyles } from '@material-ui/core/styles';

import DataCountries from 'components/DataCountries';
import DataCases from 'components/DataCases';
import DataVaccs from 'components/DataVaccs';

const tab_countries = "Countries";
const tab_cases = "Cases";
const tab_vaccinations = "Vaccinations";


const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    margin: theme.spacing(2, 0),
  },
  databaseButtons: {
    display: "flex"
  },
  topSelector: {
    margin: theme.spacing(2, 0),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
}))

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

const Data = () => {
  const [currentTab, setCurrentTab] = React.useState(0);
  const classes = useStyles()

  return (
    <Box className={classes.root}>
      <Box className={classes.topSelector}>
        <Tabs value={currentTab} onChange={(_, val)=>{setCurrentTab(val)}}>
          <Tab className={classes.button} variant="outlined" label={tab_countries} id={0}/>
          <Tab className={classes.button} variant="outlined" label={tab_cases} id={1}/>
          <Tab className={classes.button} variant="outlined" label={tab_vaccinations} id={1}/>
        </Tabs>

        <Box>
          <Button sx={{m: 1}} startIcon={<ReplayIcon/>}> Сбросить </Button>
          <Button sx={{m: 1}} startIcon={<DownloadIcon/>}> Скачать </Button>
          <Button sx={{m: 1}} startIcon={<UploadIcon/>}> Загрузить </Button>
        </Box>
      </Box>

      <Paper sx={{position: "absolute", width: "100%"}}>
        <TabPanel value={currentTab} index={0}><DataCountries /></TabPanel>
        <TabPanel value={currentTab} index={1}><DataCases /></TabPanel>
        <TabPanel value={currentTab} index={2}><DataVaccs /></TabPanel>
      </Paper>
    </Box>
  )
}

export default Data
