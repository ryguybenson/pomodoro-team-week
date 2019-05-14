import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import Sound from 'react-sound';
import soundfile from '../../audio/the-little-dwarf.mp3';
// import MomentDurationFormat from 'moment-duration-format';
// import ReactAudioPlayer from 'react-audio-player
// import SoundAlarm from './SoundAlarm';
import { connect } from 'react-redux';
import TimerList from './TimerList'
import { createTimer } from '../../actions/timerActions'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'


class Timer extends Component {
  constructor(props){
    super(props)
    this.state = {
      time: 0,
      timer: null,
      count: 1,
      display: null,
      stop: false,
      stopButton: null,
      formattedTime: null,
      audio: true,
    }
    this.updateTimer = this.updateTimer.bind(this);
    // this.componentWillMount = this.componentWillMount.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.checkPause = this.checkPause.bind(this);
    this.addZeros = this.addZeros.bind(this);
  }

  componentWillMount() {
    this.setState({formattedTime: '25:00'})
    const setTime = new Moment.duration(25, 'minutes');
    this.setState({time: setTime});
    let newDisplay = <div><button className="focusButton" type='button' onClick={() => this.startTimer(5)}>Start Focusing</button></div>
    this.setState({display: newDisplay})
    let newAudio = new Audio(soundfile);
    this.setState({audio: newAudio});
  }



  getNewGiphy() {
    let url = `https://api.giphy.com/v1/gifs/random?api_key={FILL-IN}&tag=puppy&rating=PG`;
    // let url = 'https://dog.ceo/api/breeds/image/random'
    // fetch(url).then(response => response.json()).then(
    //   (json) => {
    //   let gifObj = json.message;
    //   console.log(json.message)
    //   console.log(gifObj);
    //   }
    // )
    fetch(url).then(function(response) {
      return response.json();
    }).then(function(myJson){
      console.log(JSON.stringify(myJson));
    });
  };




  updateTimer() {
    // console.log(this.state.time)
    let newTime = this.state.time.subtract(1, 'seconds');
    let newDisplay;
    this.setState({time: newTime});
    this.addZeros(this.state.time._data.minutes, this.state.time._data.seconds);
    setInterval(this.checkPause, 1000);
    if (this.state.time._data.minutes === 0 && this.state.time._data.seconds === 0) {
      this.muteAlarm();
      clearInterval(this.state.timer)
      let newCount = this.state.count + 1;
      this.setState({count: newCount});
      if (this.state.count % 8 === 0) {
        newDisplay = <div><button type='longBreakButton' onClick={() => this.startBreak(10)}>Long Break</button></div>
        this.setState({display: newDisplay})
        console.log('long break');
      }
      else if (this.state.count % 2 === 0) {
        newDisplay = <div><button type='button' onClick={() => this.startBreak(5)}>Short Break</button></div>
        this.setState({display: newDisplay})
        console.log('short break');
      } else {
        newDisplay = <div><button className="focusButton" type='button' onClick={() => this.startTimer(5)}>Start Focusing</button></div>
        this.setState({display: newDisplay})
        console.log('focus');
      }
    }
    if (this.state.stop === false) {
      let pauseButton = <div><button type='button' onClick={() => {
          this.setState({stop: true});
          clearInterval(this.state.timer);
        }}>Pause</button></div>
      this.setState({stopButton: pauseButton});
    }
  }

  checkPause() {
    if (this.state.stop === false) {
      let pauseButton = <div><button type='button' onClick={() => {
          this.setState({stop: true});
          clearInterval(this.state.timer);
        }}>Pause</button></div>
      this.setState({stopButton: pauseButton});
    } else if (this.state.stop === true) {
      let resumeButton = <div><button type='button' onClick={() => {
          this.setState({stop: false});
          let resumeTimer = setInterval(this.updateTimer, 1000);
          this.setState({timer: resumeTimer})
        }}>Resume</button></div>
      this.setState({stopButton: resumeButton});
    }
    if (this.state.time._data.minutes === 0 && this.state.time._data.seconds === 0) {
      let stopDisplay = null;
      this.setState({stopButton: stopDisplay});
    }

  }

  muteAlarm(){
    let song = new Audio(soundfile);
    if(this.state.audio) {
      console.log(song.play())
    }
    else if (!this.state.audio){
      console.log('sound is off')
    }
  }

  startTimer(number, date) {
    let updateFormattedTime = number + ":00";
    this.setState({formattedTime: updateFormattedTime});
    const setTime = new Moment.duration(number, 'minutes');
    date = new Date();
    this.setState({time: setTime})
    // console.log(this.state.time)
    let timerStart = setInterval(() => {
      this.updateTimer()
    },1000)
    this.setState({timer: timerStart})
    this.props.createTimer(number, date)
  }

  startBreak(number) {
    let updateFormattedTime = number + ":00";
    this.setState({formattedTime: updateFormattedTime});
    const setTime = new Moment.duration(number, 'seconds');
    this.setState({time: setTime})
    // console.log(this.state.time)
    let timerStart = setInterval(() => {
      this.updateTimer()
    },1000)
    this.setState({timer: timerStart})
  }

  addZeros(m,s){
    let newFormattedTime = ("0"+m).substr(-2) + ":" +("0"+s).substr(-2);
    this.setState({formattedTime: newFormattedTime})
  }

  render() {
    const { timers, auth } = this.props;
    console.log(this.props)
    if (!auth.uid) return <Redirect to='/signin' />
    return(
      <div>
        <div>
          <TimerList timers={timers} />
        </div>
        <h1>Timer works</h1>
        <audio />
        {this.state.formattedTime}
        {this.state.display}
        {this.state.stopButton}
        <button type='button' onClick={() => {
            let audioPref = !this.state.audio;
            this.setState({audio: audioPref})}}>Toggle Alarm</button>
        </div>
    );
  }
}




const mapStateToProps = (state) => {
  return{
    timers: state.firestore.ordered.timers,
    auth: state.firebase.auth
  }
}
const mapDispatchToProps = (dispatch) =>{
  return {
    createTimer: (timer, date) => dispatch(createTimer(timer, date))
  }
}

export default compose(
  connect (mapStateToProps, mapDispatchToProps),
  firestoreConnect([{
    collection: 'timers'
  }])
)(Timer);
