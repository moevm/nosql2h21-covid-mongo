import React from 'react';
import { Chart } from 'chart.js';
import { Line } from 'react-chartjs-2';

import chroma from 'chroma-js';

const setupDataset = (data, label, color) => ({
  label,
  data,
  borderColor: color.hex(),
  borderWidth: 1,
  fill: "origin",
  backgroundColor: color.alpha(0.4).hex(),
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
      position: "top",
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
tooltipPlugin.positioners.top = function(items) {
  const pos = tooltipPlugin.positioners.average(items)

  if (pos === false) {
    return false
  }

  const chart = this._chart;

  return {
    x: pos.x,
    y: chart.chartArea.top
  }
}

const int = value => ~~value

const CasesComarisonChart = ({data1, data2, country1, country2, label="data", smoothedLabel="smoothed data", color1, color2}) => {
  return (
    <Line
      data={{
        datasets: [
          setupSmoothedDataset(
            data2.map(item => ({x: item.date, y: int(item.new_cases_smoothed)})),
            `${country2} ${smoothedLabel}`, chroma(color2).darken(2)
          ),
          setupDataset(
            data2.map(item => ({x: item.date, y: item.new_cases})),
            `${country2} ${label}`, chroma(color2)
          ),
          setupSmoothedDataset(
            data1.map(item => ({x: item.date, y: int(item.new_cases_smoothed)})),
            `${country1} ${smoothedLabel}`, chroma(color1).darken(2)
          ),
          setupDataset(
            data1.map(item => ({x: item.date, y: item.new_cases})),
            `${country1} ${label}`, chroma(color1)
          ),
        ]
      }}
      options={chartOptions}
      plugins={[verticalLinePlugin]}
      width="100%"
    />
  )
}

export default CasesComarisonChart
