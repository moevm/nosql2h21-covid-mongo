import React, {useEffect} from 'react';
import CircularProgress from '@mui/material/CircularProgress'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatISO } from 'date-fns';

import useFetch from 'hooks/useFetch';
import {CASES_PER_DAY} from 'api/endpoints';
import {AGGREGATE_CASES_MIN} from 'api/endpoints';
import {AGGREGATE_CASES_MAX} from 'api/endpoints';
import {AGGREGATE_CASES_AVG} from 'api/endpoints';
import {AGGREGATE_CASES_TOTAL} from 'api/endpoints';

import WorldChart from 'components/WorldChart';
import AggregationMenu from 'components/AggregationMenu';
import AggregationModal from 'components/AggregationModal';

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

const CasesChart = ({isoCode = null, dateFrom = null, dateTo = null}) => {
  const [aggregation, setAggregation] = React.useState(null)
  const [modalOpen, setModalOpen] = React.useState(Boolean(aggregation))

  const [cases, performCasesFetch] = useFetch(CASES_PER_DAY)

  const aggregationFunctions = {
    sum: "Общее",
    average: "Среднее",
    min: "Минимальное",
    max: "Максимальное",
  }

  const aggregationFetch = {
    sum: Object.fromEntries(zip(["status", "performFetch"], useFetch(AGGREGATE_CASES_TOTAL))),
    average: Object.fromEntries(zip(["status", "performFetch"], useFetch(AGGREGATE_CASES_AVG))),
    min: Object.fromEntries(zip(["status", "performFetch"], useFetch(AGGREGATE_CASES_MIN))),
    max: Object.fromEntries(zip(["status", "performFetch"], useFetch(AGGREGATE_CASES_MAX))),
  } 

  useEffect(()=>{
    if (aggregation !== null) {
      setModalOpen(true)
    }
  }, [aggregation])

  useEffect(() => {
      performCasesFetch({
        iso_code: isoCode,
        date_from: dateFrom && formatISO(dateFrom, {representation: "date"}),
        date_to: dateTo && formatISO(dateTo, {representation: "date"})
      })
  }, [performCasesFetch, isoCode, dateFrom, dateTo])

  const handleMenuClick = (key, value) => {
    aggregationFetch[key].performFetch({
      iso_code: isoCode,
      date_from: dateFrom && formatISO(dateFrom, {representation: "date"}),
      date_to: dateTo && formatISO(dateTo, {representation: "date"})
    })
    if (key === aggregation) {
      setModalOpen(true)
    }
    setAggregation(key);
  }

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
      <Box sx={{width: "100%", height: "100%", position: "relative"}}>
        <AggregationMenu onMenuClick={handleMenuClick} items={aggregationFunctions}/>
        <WorldChart data={data} label="New cases" smoothedLabel="7-day avg" primaryColor="#174ea6" secondaryColor="#8ab4f8"/>
        <AggregationModal
          open={modalOpen}
          onClose={()=>{setModalOpen(false)}}
          header={`${aggregationFunctions[aggregation]} количество заболевших`}
          datePeriod={{from: dateFrom, to: dateTo}}
          fetchState={aggregationFetch[aggregation]?.status || {data: null, loading: false, error: null}}
        />
      </Box>
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
