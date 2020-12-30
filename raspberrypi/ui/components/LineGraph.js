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
    
    let minuteData = [];

    for (let item of this.props.data)
    {
      if ((now - new Date(item['timestamp'])) <= 5*60*1010)
      {
        minuteData.push(item);
      }
    }

    for (let i = 0; i <= 5*6; i++)
    {
      let sum = 0;
      let count = 0;

      for (let item of minuteData)
      {
        if (
          ((now - new Date(item['timestamp'])) >= (i)*10000) &&
          ((now - new Date(item['timestamp'])) <= (i+1)*10000)
        )
        {
          let dataKey = parseFloat(item[this.props.dataKey]);

          if (dataKey > -999.00)
          {
            sum += dataKey;
            count += 1;
          }
        }
      }
      
      data.push((sum / count).toFixed(2));
      label.push((i)*10000);
    }

    let lineData = {
      labels: label,
      datasets: [
        {
          label: this.props.text,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
          pointHitRadius: 7,
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
              max: 5*60*1001,
              min: 0,
              stepSize: 0,
              maxTicksLimit: 1,
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
              labelString: 'Last 5 minutes'
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
