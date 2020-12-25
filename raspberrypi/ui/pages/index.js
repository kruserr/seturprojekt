import React from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import LineGraph from '../components/LineGraph';


export default class Home extends React.Component
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
    let getNewestObs = () => {
      fetch('http://localhost:3000/api/getNewestObs')
        .then(j => j.json())
        .then(newData => {
          let data = this.state.data;
          data.push(newData);
          this.setState({ data });
        });
    }

    setInterval(getNewestObs, 2000);
  }

  render()
  {
    return (
      <div className={styles.container}>
        <Head>
          <title>Create Next App</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <LineGraph
            data={this.state.data}
            dataKey={'temp'}
            dataMin={22}
            dataMax={24}
            text={'Temperature'}
            color={'rgba(75,192,192,0.65)'}
          />
          <LineGraph
            data={this.state.data}
            dataKey={'humid'}
            dataMin={40}
            dataMax={60}
            text={'Humidity'}
            color={'rgba(192,192,75,0.65)'}
          />
        </main>
      </div>
    );
  }
}
