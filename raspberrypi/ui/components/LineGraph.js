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

    for (let i = 6; i >= 0; i--)
    {
      let hourData = [];

      for (let item of this.props.data)
      {
        if ((now - new Date(item.timestamp)) > i*60*60*1000)
        {
          hourData.push(item[this.props.dataKey]);
        }
      }

      label.push(new Date(now - new Date(i*60*60*1000)));
      data.push((hourData.reduce((a, b) => a + b, 0) / hourData.length).toFixed(2));
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
          fontColor: 'white'
        },
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            ticks: {
              fontColor: 'white',
              stepSize: 1,
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
        yAxes: [
          {
            ticks: {
              fontColor: 'white',
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
