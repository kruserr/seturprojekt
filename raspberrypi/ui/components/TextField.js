import React from 'react';
import styles from '../styles/TextField.module.css';


export default class TextField extends React.Component
{
  constructor(props)
  {
    super(props);

    this.event = {};
    this.element = React.createRef();
  }

  changeInputColor(color)
  {
    this.event.target.elements[0].style = `border-color: ${color}`;
    new Promise(res => setTimeout(res, 2000))
      .then(() => { this.event.target.elements[0].style = 'border-color: transperent'; });
  }

  componentDidMount()
  {
    this.element.current.onsubmit = (event) => {
      this.event = event;
      this.event.preventDefault();

      let input = this.event.target.elements[0].value;
      
      // https://stackoverflow.com/a/17858524
      let re = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;

      // Test if crontab is valid
      if (!re.test(input))
      {
        this.changeInputColor('red');
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

      this.changeInputColor('green');
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
