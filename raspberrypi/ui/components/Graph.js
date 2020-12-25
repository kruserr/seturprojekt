import React from 'react';
import {Line} from 'react-chartjs-2';


export default class Graph extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = {
      'data': []
    };
  }

  componentDidMount()
  {
    let increment = () => {
      fetch('http://localhost:3000/api/increment')
        .then(j => j.json())
        .then(newData => {
          let data = this.state.data;
          data.push(newData);
          this.setState({ data });
        });
    }

    setInterval(increment, 2000);
  }

  render()
  {
    let tempLabel = [];
    let tempData = [];

    for (let item of this.state.data)
    {
      tempLabel.push(item.timestamp);
      tempData.push(item.temp);
    }

    let data = {
      labels: tempLabel,
      datasets: [
        {
          label: 'Temperature',
          fill: false,
          borderColor: 'rgba(75,192,192,0.65)',
          data: tempData
        }
      ]
    };

    let options = {
      scales: {
        yAxes: [
          {
            ticks: {
                suggestedMax: 2400,
                suggestedMin: 2200,
                stepSize: 10,
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
      <div>
        <Line
          data={data}
          options={options}
          width={400}
          height={400}
        />
      </div>
    );
  }
}
