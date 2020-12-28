import React from 'react';
import styles from '../styles/TextField.module.css';


export default class TextField extends React.Component
{
  constructor(props)
  {
    super(props);

    this.element = React.createRef();
  }

  componentDidMount()
  {
    this.element.current.onsubmit = (event) => {
      event.preventDefault();

      let input = event.target.elements[0].value;
      
      // https://stackoverflow.com/a/17858524
      let re = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;

      // Test if crontab is valid
      if (!re.test(input))
      {
        event.target.elements[0].style = 'border-color: red';
        event.target.elements[0].blur();

        return;
      }

      let data = {};
      data[this.props.dataKey] = input;

      fetch(
        this.props.url,
        {
          'method': 'POST',
          'body': JSON.stringify(data)
        }
      );

      event.target.elements[0].style = 'border-color: green';
      event.target.elements[0].blur();
    }
  }

  render()
  {
    return (
      <form ref={this.element} className={styles.form}>
        <label className={styles.label} htmlFor={this.props.dataKey}>{this.props.text}</label>
        <input className={styles.input} type="text" id={this.props.dataKey} name={this.props.dataKey} placeholder={this.props.placeHolder}/>
      </form>
    );
  }
}
