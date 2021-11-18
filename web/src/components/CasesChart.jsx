import React, {useEffect} from 'react';
import CircularProgress from '@mui/material/CircularProgress'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'
import {Line} from 'react-chartjs-2';


import useFetch from 'hooks/useFetch';
import {CASES_PER_DAY} from 'api/endpoints';

function int(value) {
  return ~~value
}

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

  const chart = (response) => {
    const data = response.data;
    return (
      <Line
        data={{
          datasets: [{
            label: "New cases",
            data: data.map(item => ({x: item.date, y: item.new_cases})),
            borderColor: "red",
            fill: "origin",
            backgroundColor: "yellow",
            pointRadius: 0,
            hoverRadius: 0,
            showLine: true,
            order: 1
          }, {
            label: "7-day avg",
            data: data.map(item => ({x: item.date, y: int(item.new_cases_smoothed)})),
            borderColor: "green",
            pointRadius: 0,
            hoverBackgroundColor: "green",
            showLine: true,
            order: 0
          }]
        }}
        options={{
          maintainAspectRatio: false,
          scales: {
            xAxes: {
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10
              }
            }
          },
          mouseLine: {
            color: "magenta"
          },
          interaction: {
            intersect: false,
            mode: "index"
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              displayColors: false,
              callbacks: {
                afterTitle: (items) => {
                  items.reverse()
                }
              }
            },
          }
        }}
        plugins={[
          {
            id: 'mouseLine',
            afterEvent: function (chart, {event: e}) {
              var chartArea = chart.chartArea;
              if (
                e.x >= chartArea.left &&
                e.y >= chartArea.top &&
                e.x <= chartArea.right &&
                e.y <= chartArea.bottom &&
                chart._active.length
              ) {
                chart.options.mouseLine.x = chart._active[0].element.x;
              } else {
                chart.options.mouseLine.x = NaN;
              }
            },
            afterDraw: function (chart, _) {
              var ctx = chart.ctx;
              var chartArea = chart.chartArea;
              var x = chart.options.mouseLine.x;

              if (!isNaN(x)) {
                ctx.save();
                ctx.strokeStyle = chart.options.mouseLine.color;
                ctx.setLineDash([5, 10])
                ctx.lineWidth = 1
                ctx.moveTo(chart.options.mouseLine.x, chartArea.bottom);
                ctx.lineTo(chart.options.mouseLine.x, chartArea.top);
                ctx.stroke();
                ctx.restore();
              }
            }
          }
        ]}
        width="100%"
      />
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
