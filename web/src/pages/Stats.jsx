import React from 'react'

import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@material-ui/core/styles'

import AspectRatioBox from 'components/AspectRatioBox'
import CasesChart from 'components/CasesChart'
import VaccsChart from 'components/VaccsChart'

const tab_incidents = "Заболевамость"
const tab_vaccinations = "Вакцинации"


function TabPanel({children, value, index, ...other}) {
  return(
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
}))

export default function Stats() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [dates, setDates] = React.useState(null);

  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.chartType}>
        <Tabs value={currentTab} onChange={(e, newValue) => {setCurrentTab(newValue)}}>
          <Tab className={classes.button} variant="outlined" label={tab_incidents} id={0} />
          <Tab className={classes.button} variant="outlined" label={tab_vaccinations} id={1} />
        </Tabs>
      </Box>

      <Paper>
        <AspectRatioBox ratio={16/8}>
          <TabPanel value={currentTab} index={0}>
            <CasesChart dates={dates} setDates={setDates}/>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <VaccsChart dates={dates} setDates={setDates}/>
          </TabPanel>
        </AspectRatioBox>
      </Paper>
    </Box>
  )
}
