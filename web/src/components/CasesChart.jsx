import React, {useEffect} from 'react';
import CircularProgress from '@mui/material/CircularProgress'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'


import useFetch from 'hooks/useFetch';
import {CASES_PER_DAY} from 'api/endpoints';

import WorldChart from 'components/WorldChart';

const CasesChart = ({isoCode = null}) => {
  const [cases, performCasesFetch] = useFetch(CASES_PER_DAY)

  useEffect(() => {
    if (isoCode) {
      performCasesFetch({iso_code: isoCode})
    } else {
      performCasesFetch()
    }
  }, [performCasesFetch, isoCode])

  const loading = () => (
    <Box sx={{display: "flex", width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
      <CircularProgress size="5rem"/>
    </Box>
  )

  const error = (message) => (
    <Box sx={{
      display: "flex",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <SentimentVeryDissatisfiedIcon color="primary" style={{width: "10rem", height: "10rem"}}/>
      <Typography variant="h6">{message}</Typography>
    </Box>
  )

  const chart = (response) => 
  {
    const data = response.data.map(item => ({
      date: item.date,
      value: item.new_cases,
      value_smoothed: item.new_cases_smoothed
    }));
    return (
      <WorldChart data={data} label="New cases" smoothedLabel="7-day avg" primaryColor="#174ea6" secondaryColor="#8ab4f8"/>
    )
  }

  return (
    <>
      {cases.loading || (!cases.data && !cases.error)
        ? loading()
        : cases.error
          ? error(cases.error.message)
          : chart(cases.data)
      }
    </>
  )
}

export default CasesChart
