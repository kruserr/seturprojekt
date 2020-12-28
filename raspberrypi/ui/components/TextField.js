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
      
      // Test if crontab is valid
      if ((this.props.re) && (!this.props.re.test(input)))
      {
        this.changeInputColor('red');
        return;
      }

      fetch(
        this.props.url,
        {
          'method': 'POST',
          'body': JSON.stringify({'data': input})
        }
      )
        .then(body => body.json())
        .then(j => console.log(j));

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
