import React from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListSubheader from '@mui/material/ListSubheader';
import TextField from '@mui/material/TextField'; 
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import { subDays, addDays, isValid } from 'date-fns';

import {makeStyles} from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
  date: {
    margin: theme.spacing(1)
  }
}))

const isDateGood = (date) => {
  return (
    (date.dateFrom === null || (isValid(date.dateFrom) && date.dateFrom?.getFullYear() >= 1900)) &&
    (date.dateTo === null || (isValid(date.dateTo) && date.dateTo?.getFullYear() >= 1900))
  )
}

const DateSelect = ({value={dateFrom: null, dateTo: null}, onChange, vertical=false, label=""}) => {
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

    if (isDateGood(newDate)) {
      onChange(newDate)
    }
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
  }

  const verticalList = (from, to) => (
    <List subheader={<ListSubheader>{label}</ListSubheader>}>
      <ListItem>{from}</ListItem>
      <ListItem>{to}</ListItem>
    </List>
  )

  const horizontalList = (from, to) => (
    <>
      <Box className={classes.date}>{from}</Box>
      <Box className={classes.date}>{to}</Box>
    </>
  )

  const from = (
    <DesktopDatePicker
      value={value.dateFrom}
      label="От"
      inputFormat="dd.MM.yyyy"
      mask="__.__.____"
      onChange={onDateFromChange}
      renderInput={(params)=><TextField {...params}/>}
    />
  )

  const to = (
    <DesktopDatePicker
      value={value.dateTo}
      label="До"
      inputFormat="dd.MM.yyyy"
      mask="__.__.____"
      onChange={onDateToChange}
      renderInput={(params)=><TextField {...params}/>}
    />
  )

  return (
    <Box sx={{display: "flex", alignItems: "center"}}>
      {vertical ? verticalList(from, to) : horizontalList(from, to)}
    </Box>
  )
}

export default DateSelect
