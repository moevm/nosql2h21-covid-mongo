import React from 'react';

import { Chart } from 'chart.js';
import { Line } from 'react-chartjs-2';

const verticalLinePlugin = {
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
  beforeDatasetDraw: function (chart, {index, ...other}) {
    if (index !== 0) return

    var ctx = chart.ctx;
    var chartArea = chart.chartArea;
    var x = chart.options.mouseLine.x;

    if (!isNaN(x)) {
      ctx.save();
      
      ctx.strokeStyle = chart.options.mouseLine.color;
      ctx.setLineDash([5, 10])
      ctx.lineWidth = 1

      ctx.beginPath();
      ctx.moveTo(x, chartArea.bottom);
      ctx.lineTo(x, chartArea.top);
      ctx.stroke();

      ctx.restore();
    }
  }
}

const DensityChart = ({data}) => {
  console.log(data)
  return (
    <Line
      data={
        {
          labels: data.map(o => o.density),
          datasets: [{
            data: data.map(o => o.cases),
            borderColor: "#0000FF"
          }]
        }
      }
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
          color: "#333"
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
            position: "average",
            callbacks:{
              title: (context)=>data[context[0].dataIndex].iso_code,
              beforeBody: (context)=>`d: ${data[context[0].dataIndex].density}`
            }
          },
        }
      }}
      plugins={[verticalLinePlugin]}
      width="100%"
    />
  )
}

export default DensityChart
