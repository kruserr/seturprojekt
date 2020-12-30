import React from 'react';
import styles from '../styles/Home.module.css';

import Head from 'next/head';
import LineGraph from '../components/LineGraph';
import TextField from '../components/TextField';


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
      'data': this.props.data
    };
  }

  getStartId()
  {
    if (this.state.data.length > 0)
      return this.state.data[this.state.data.length - 1].id + 1;
    return 1;
  }

  componentDidMount()
  {
    let newest = () => {
      fetch(`http://localhost:3000/api/obs/newest`)
        .then(j => j.json())
        .then(newest => {
          fetch(
            'http://localhost:3000/api/obs/getRange',
            {
              'method': 'POST',
              'body': JSON.stringify({'start': this.getStartId(), 'end': newest.id})
            }
          )
            .then(j => j.json())
            .then(missing => {
              let data = this.state.data;

              for (let item of missing)
              {
                let match = false;

                for (let innerItem of data)
                {
                  if (item.id == innerItem.id)
                  {
                    match = true;
                  }
                }

                if (!match)
                {
                  data.push(item);
                }
              }
              
              this.setState({ data });
            });
        })
        .catch(() => { });
    }

    setInterval(newest, 10000);
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
            dataMin={16}
            dataMax={30}
            text={'Temperature °C'}
            color={'rgba(75,192,192,0.65)'}
            textColor={'#FFF'}
          />
          <LineGraph
            data={this.state.data}
            dataKey={'humid'}
            dataMin={20}
            dataMax={80}
            text={'Humidity %'}
            color={'rgba(192,192,75,0.65)'}
            textColor={'#FFF'}
          />
        </div>
        <div className={styles.scheduleControls}>
          <div className={styles.pumpScheduleControls}>
            {/* https://stackoverflow.com/a/17858524 */}
            <TextField
              text={'Pump Schedule (cron)'}
              dataKey={'pumpSchedule'}
              placeHolder={'* * * * *'}
              url={'http://localhost:3000/api/pump/schedule'}
              re={/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/}
            />

            {/* https://stackoverflow.com/questions/7036324/what-is-the-regex-for-any-positive-integer-excluding-0 */}
            <TextField
              text={'Pump Interval (s)'}
              dataKey={'pumpInterval'}
              placeHolder={'2'}
              url={'http://localhost:3000/api/pump/interval'}
              re={/^[1-9]\d*$/}
            />
          </div>
          <div className={styles.lightScheduleControls}>
            {/* https://stackoverflow.com/a/17858524 */}
            <TextField
              text={'Light Schedule (cron)'}
              dataKey={'lightSchedule'}
              placeHolder={'* * * * *'}
              url={'http://localhost:3000/api/light/schedule'}
              re={/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/}
            />
            
            {/* https://stackoverflow.com/questions/7036324/what-is-the-regex-for-any-positive-integer-excluding-0 */}
            <TextField
              text={'Light Interval (s)'}
              dataKey={'lightInterval'}
              placeHolder={'21600'}
              url={'http://localhost:3000/api/light/interval'}
              re={/^[1-9]\d*$/}
            />
          </div>
        </div>
      </div>
    );
  }
}
