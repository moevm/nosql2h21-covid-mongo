import React from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField'; 
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import { subDays, addDays } from 'date-fns';

import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  date: {
    margin: theme.spacing(1)
  }
}))

const DateSelect = ({value={dateFrom: null, dateTo: null}, onChange, vertical}) => {
  const [date, setDate] = React.useState({
    dateFrom: null,
    dateTo: null,
    ...value
  })

  const classes = useStyles();

  const onDateFromChange = (newFromDate) => {
    const newDate = {dateFrom: newFromDate, dateTo: date.dateTo};

    if (date.dateTo && newFromDate){
      const acceptedToDate = addDays(newFromDate, 5)
      if (date.dateTo < acceptedToDate) {
        newDate.dateTo = acceptedToDate
      }
    }

    setDate(newDate)
    onChange(newDate)
  }

  const onDateToChange = (newToDate) => {
    const newDate = {dateFrom: date.dateFrom, dateTo: newToDate}

    if (newToDate && date.dateFrom){
      const acceptedFromDate = subDays(newToDate, 5)
      if (date.dateFrom > acceptedFromDate) {
        newDate.dateFrom = acceptedFromDate
      }
    }

    setDate(newDate)
    onChange(newDate)
  }

  return (
    <Box sx={{display: "flex", alignItems: "center", flexDirection: vertical ? "column" : "row"}}>
      <Box className={classes.date}>
        <DesktopDatePicker
          value={value.dateFrom}
          label="От"
          inputFormat="dd.MM.yyyy"
          mask="__.__.____"
          onChange={onDateFromChange}
          renderInput={(params)=><TextField {...params}/>}
        />
      </Box>

      <Box className={classes.date}>
        <DesktopDatePicker
          value={value.dateTo}
          label="До"
          inputFormat="dd.MM.yyyy"
          mask="__.__.____"
          onChange={onDateToChange}
          renderInput={(params)=><TextField {...params}/>}
        />
      </Box>
    </Box>
  )
}

export default DateSelect
