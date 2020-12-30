import React from 'react';
import styles from '../styles/LineGraph.module.css';

import { Line } from 'react-chartjs-2';


export default class Graph extends React.Component
{
  render()
  {
    let label = [];
    let data = [];

    const now = new Date();
    
    for (let item of this.props.data)
    {
      if ((now - new Date(item['timestamp'])) <= 5*60*1000)
      {
        data.push(item[this.props.dataKey]);
        label.push(now - new Date(item['timestamp']));
      }
    }

    let lineData = {
      labels: label,
      datasets: [
        {
          label: this.props.text,
          fill: false,
          pointHitRadius: 5,
          borderColor: this.props.color,
          backgroundColor: this.props.color,
          data: data,
        }
      ]
    };

    let lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'top',
        labels: {
          fontColor: this.props.textColor
        },
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              unit: 'minute',
              displayFormats: {
                minute: 'm:ss'
              },
              tooltipFormat:'m:ss',
            },
            ticks: {
              fontColor: 'inherit',
              max: 5*60*1000,
              min: 0,
              stepSize: 0,
              maxTicksLimit: -1,
              maxRotation: 0,
              minRotation: 0,
              reverse: true,
            },
            gridLines: {
              color: 'rgba(255,255,255,0.12)',
              zeroLineColor: 'rgba(255,255,255,0.12)',
            },
            scaleLabel: {
              fontColor: 'inherit',
              display: true,
              labelString: 'Last 5m'
            },
          }
        ],
        yAxes: [
          {
            ticks: {
              fontColor: 'inherit',
              suggestedMax: this.props.dataMax,
              suggestedMin: this.props.dataMin,
              stepSize: 0.5,
              maxTicksLimit: 6,
              maxRotation: 0,
              minRotation: 0,
            },
            gridLines: {
              color: 'rgba(255,255,255,0.12)',
              zeroLineColor: 'rgba(255,255,255,0.12)',
            },
          }
        ],
      }
    }

    return (
      <div className={styles.container}>
        <Line
          data={lineData}
          options={lineOptions}
        />
      </div>
    );
  }
}
