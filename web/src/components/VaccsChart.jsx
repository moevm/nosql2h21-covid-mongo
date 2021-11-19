import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'

import { useEffect } from 'react';

import useFetch from 'hooks/useFetch';
import { VACCS_PER_DAY } from 'api/endpoints';

import WorldChart from 'components/WorldChart';


const VaccsChart = ({dates = null, setDates = null}) => {
  const [vaccs, performVaccsFetch] = useFetch(VACCS_PER_DAY)

  useEffect(() => {
    if (dates) {
      let dateFrom = dates.dateFrom
      let dateTo = dates.dateTo
      console.log(dateFrom, dateTo)
      if (dateFrom) {
        if (dateTo) {
          performVaccsFetch({'date_from': dateFrom, 'date_to': dateTo})
        } else {
          performVaccsFetch({'date_from': dateFrom})
        }
      } else {
        if (dateTo) {
          performVaccsFetch({'date_to': dateTo})
        } else {
          performVaccsFetch()
        }
      }
    } else {
      performVaccsFetch()
    }
  }, [performVaccsFetch, dates])

  const loading = () => (
    <Box sx={{display: "flex", width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
      <CircularProgress size="5rem"/>
    </Box>
  )

  const error = (message) => (
    <Box sx={{display: "flex", width: "100%", height: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
      <SentimentVeryDissatisfiedIcon color="primary" style={{width: "10rem", height: "10rem"}}/>
      <Typography variant="h6">{message}</Typography>
    </Box>
  )

  const chart = (response) => 
  {
    const data = response.data.map(item => ({
      date: item.date,
      value: item.new_vaccinations,
      value_smoothed: item.new_vaccinations_smoothed
    }));
    return (
      <WorldChart data={data} label="New vaccinated" smoothedLabel="7-day avg" primaryColor="#137333" secondaryColor="#5bb974"
                  setDates={setDates}/>
    )
  }

  return (
    <>
      {vaccs.loading || (!vaccs.data && !vaccs.error)
        ? loading()
        : vaccs.error
          ? error(vaccs.error.message)
          : chart(vaccs.data)
      }
    </>
  )
}

export default VaccsChart
