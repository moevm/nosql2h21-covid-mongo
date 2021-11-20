import React from 'react'
import { Chart } from 'chart.js';
import { Line } from 'react-chartjs-2';

import chroma from 'chroma-js';

const setupDataset = (data, label, color) => ({
  label,
  data,
  borderColor: color.hex(),
  borderWidth: 1,
  fill: "origin",
  backgroundColor: color.alpha(0.8).hex(),
  pointRadius: 0,
  hoverRadius: 0,
  showLine: true,
})

const setupSmoothedDataset = (data, label, color) => ({
  label,
  data,
  borderColor: color.hex(),
  pointRadius: 0,
  hoverBackgroundColor: color.hex(),
  showLine: true,
})

const chartOptions = {
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
      position: "custom",
      callbacks: {
        afterTitle: (items) => {items.reverse()}
      }
    },
  }
}

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

const tooltipPlugin = Chart.registry.getPlugin('tooltip');
tooltipPlugin.positioners.custom = function(items) {
  if (items.length) {
    return {
      x: items[0].element.x,
      y: items[0].element.y,
    };
  }
  return false
}

const int = value => ~~value

const WorldChart = ({data, label="data", smoothedLabel="smoothed data", primaryColor="#737373", secondaryColor="#4d4d4d"}) => {
  primaryColor = chroma(primaryColor)
  secondaryColor = chroma(secondaryColor)

  return (
      <Line
      data={{
        datasets: [
          setupSmoothedDataset(
            data.map(item => ({x: item.date, y: int(item.value_smoothed)})),
            smoothedLabel, secondaryColor
          ),
          setupDataset(
            data.map(item => ({x: item.date, y: item.value})),
            label, primaryColor
          ),
        ]
      }}
      options={chartOptions}
      plugins={[verticalLinePlugin]}
      width="100%"
    />
  )
}

export default WorldChart
