import React from 'react';
import { Line } from 'react-chartjs-2';


export default class Graph extends React.Component
{
  render()
  {
    let label = [];
    let data = [];

    for (let item of this.props.data)
    {
      label.push(item.timestamp);
      data.push(item[this.props.dataKey]);
    }

    let lineData = {
      labels: label,
      datasets: [
        {
          label: this.props.text,
          fill: false,
          borderColor: this.props.color,
          data: data
        }
      ]
    };

    let lineOptions = {
      scales: {
        yAxes: [
          {
            ticks: {
                suggestedMax: this.props.dataMax,
                suggestedMin: this.props.dataMin,
                stepSize: 1,
                maxTicksLimit: 10
            }
          }
        ],
        xAxes: [
          {
            ticks: {
                maxTicksLimit: 1
            }
          }
        ]
      }
    }

    return (
      <>
        <Line
          data={lineData}
          options={lineOptions}
          width={400}
          height={400}
        />
      </>
    );
  }
}
