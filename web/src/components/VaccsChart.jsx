import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatISO } from 'date-fns';

import { useEffect } from 'react';

import useFetch from 'hooks/useFetch';
import { VACCS_PER_DAY } from 'api/endpoints';
import {AGGREGATE_VACCS_MIN} from 'api/endpoints';
import {AGGREGATE_VACCS_MAX} from 'api/endpoints';
import {AGGREGATE_VACCS_AVG} from 'api/endpoints';
import {AGGREGATE_VACCS_TOTAL} from 'api/endpoints';

import WorldChart from 'components/WorldChart';
import AggregationMenu from 'components/AggregationMenu';
import AggregationModal from 'components/AggregationModal';


const zip = (a, b) => a.map((k, i) => [k, b[i]]);


const VaccsChart = ({isoCode = null, dateFrom = null, dateTo = null}) => {
  const [aggregation, setAggregation] = React.useState(null)
  const [modalOpen, setModalOpen] = React.useState(Boolean(aggregation))

  const [vaccs, performVaccsFetch] = useFetch(VACCS_PER_DAY)

  const aggregationFunctions = {
    sum: "Общее",
    average: "Среднее",
    min: "Минимальное",
    max: "Максимальное",
  }

  const aggregationFetch = {
    sum: Object.fromEntries(zip(["status", "performFetch"], useFetch(AGGREGATE_VACCS_TOTAL))),
    average: Object.fromEntries(zip(["status", "performFetch"], useFetch(AGGREGATE_VACCS_AVG))),
    min: Object.fromEntries(zip(["status", "performFetch"], useFetch(AGGREGATE_VACCS_MIN))),
    max: Object.fromEntries(zip(["status", "performFetch"], useFetch(AGGREGATE_VACCS_MAX))),
  }

  useEffect(()=>{
    if (aggregation !== null) {
      setModalOpen(true)
    }
  }, [aggregation])
  
  useEffect(() => {
    performVaccsFetch({
      iso_code: isoCode,
      date_from: dateFrom && formatISO(dateFrom, {representation: "date"}),
      date_to: dateTo && formatISO(dateTo, {representation: "date"})
    })
  }, [performVaccsFetch, isoCode, dateFrom, dateTo])

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
      <Box sx={{width: "100%", height: "100%", position: "relative"}}>
        <AggregationMenu onMenuClick={handleMenuClick} items={aggregationFunctions}/>
        <WorldChart data={data} label="New vaccinated" smoothedLabel="7-day avg" primaryColor="#137333" secondaryColor="#5bb974"/>
        <AggregationModal
            open={modalOpen}
            onClose={()=>{setModalOpen(false)}}
            header={`${aggregationFunctions[aggregation]} количество вакцинированных`}
            datePeriod={{from: dateFrom, to: dateTo}}
            fetchState={aggregationFetch[aggregation]?.status || {data: null, loading: false, error: null}}
          />
      </Box>
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
