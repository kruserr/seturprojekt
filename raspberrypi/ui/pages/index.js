import React from 'react';
import styles from '../styles/Home.module.css';

import Head from 'next/head';
import LineGraph from '../components/LineGraph';


export async function getServerSideProps()
{
  const res = await fetch('http://localhost:3000/api/obs/lastDay');
  const data = await res.json();

  return { props: { data } };
}

export default class Home extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = {
      'data': props.data
    };
  }

  componentDidMount()
  {
    let newest = () => {
      fetch('http://localhost:3000/api/obs/newest')
        .then(j => j.json())
        .then(newData => {
          let data = this.state.data;
          data.push(newData);
          this.setState({ data });
        });
    }

    setInterval(newest, 2000);
  }

  render()
  {
    return (
      <div style={{background: '#181818', minHeight: '100vh'}}>
        <Head>
          <title>Create Next App</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className={styles.grid}>
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
        </div>
      </div>
    );
  }
}
