import React from 'react'

import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'

import { makeStyles } from '@material-ui/core/styles'

const tab_incidents = "Заболевамость"
const tab_vaccinations = "Вакцинации"


function TabPanel({children, value, index, ...other}) {
  return(
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
      {value === index && (
        <Box>
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
  button: {
    border: "1px solid",
    borderColor: theme.palette.primary.main,
    margin: theme.spacing(0, 1)
  }
}))

export default function Stats() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box>
        <Tabs value={currentTab} onChange={(e, newValue) => {setCurrentTab(newValue)}}>
          <Tab className={classes.button} variant="outlined" label={tab_incidents} id={0} />
          <Tab className={classes.button} variant="outlined" label={tab_vaccinations} id={1} />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        <Typography>Заболевамость</Typography>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Typography>Вакцинация</Typography>
      </TabPanel>
    </Box>
  )
}
