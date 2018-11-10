import React, { Component } from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';

import './home.css';


import { toggleLoader, changeLoaderText } from '../../Actions/pss.actions';
import { getQuestions, getLiveStatus } from '../../Actions/api.actions';


class Home extends Component {


    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            question: '',
            options: [],
            questionType: '',
            answer: '',
            disableButtons: false
        }
    }

    componentDidMount() {
        this.props.getLiveStatus(this.props.deviceId);
        this.props.getQuestions();
    }

    loadQuestion() {
        if (this.state.index === this.props.quiz.length - 2) {
            this.props.getQuestions();
        }
        $('.optionbutton').css('background-color', '#007bff');
        const quiz = this.props.quiz[this.state.index];
        this.setState({
            question: quiz.question,
            options: quiz.options,
            questionType: quiz.type,
            answer: quiz.correct_answer,
            disableButtons: false
        });
    }

    handleOptionSelect = (event) => {
        this.setState({
            disableButtons: true,
            index: this.state.index + 1
        })
        let index = null;
        let bool = null;
        if (event.target.textContent === this.state.answer) {
            $('#' + event.target.id).css('background-color', 'green');
        } else {
            $('#' + event.target.id).css('background-color', 'red');
            if (this.state.questionType === 'boolean') {
                if (event.target.textContent === 'True') {
                    bool = '#bool2';
                    $('#bool2').css('background-color', 'green')
                    $('#bool2').addClass('animated tada faster')
                } else {
                    bool = '#bool1';
                    $('#bool1').css('background-color', 'green')
                    $('#bool1').addClass('animated tada faster')
                }
            } else {
                console.log('elese')
                index = this.state.options.indexOf(this.state.answer);
                console.log(index)
                $('#option' + index).css('background-color', 'green');
                $('#option' + index).addClass('animated tada faster');
            }
        }
        setTimeout(() => {
            if (index) {
                $('#option' + index).removeClass('animated tada faster');
            }
            if (bool) {
                $(bool).removeClass('animated tada faster');
            }
            this.loadQuestion();
        }, 1500)
    }

    render() {
        if (this.state.question === '' && this.props.quiz.length > 0) {
            this.loadQuestion();
        }
        return (
            <div className="home">
                {this.props.liveStatus ?
                    <div className="container-fluid clearfix">
                        <div className="float-left">
                            <p className="h6 ">Start Time : {this.props.liveStatus.StartTime}</p>
                        </div>
                        <div className="float-right">
                            <p className="h6">Up Time : {this.props.liveStatus.UpTime}</p>
                        </div>
                    </div>
                    : null
                }
                {
                    this.state.question !== '' ?
                        <div className="container-fluid card quiz-card shadow text-center p-0">
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-12 p-0">
                                        <p className="h5"> {this.state.question}</p>
                                    </div>
                                </div>
                                {
                                    this.state.questionType === 'multiple' ?
                                        <div>
                                            <div className="row mb-4">
                                                <div className="col-6"><button type="button" id="option0" disabled={this.state.disableButtons} onClick={this.handleOptionSelect} className="btn btn-primary w-100 optionbutton">{this.state.options[0]}</button></div>
                                                <div className="col-6"><button type="button" id="option1" disabled={this.state.disableButtons} onClick={this.handleOptionSelect} className="btn btn-primary w-100 optionbutton">{this.state.options[1]}</button></div>
                                            </div>
                                            <div className="row mb-1">
                                                <div className="col-6"><button type="button" id="option2" disabled={this.state.disableButtons} onClick={this.handleOptionSelect} className="btn btn-primary w-100 optionbutton">{this.state.options[2]}</button></div>
                                                <div className="col-6"><button type="button" id="option3" disabled={this.state.disableButtons} onClick={this.handleOptionSelect} className="btn btn-primary w-100 optionbutton">{this.state.options[3]}</button></div>
                                            </div>
                                        </div> :
                                        <div>
                                            <div className="row mb-1">
                                                <div className="col-6"><button type="button" id="bool1" onClick={this.handleOptionSelect} className="btn btn-primary w-100 optionbutton">True</button></div>
                                                <div className="col-6"><button type="button" id="bool2" onClick={this.handleOptionSelect} className="btn btn-primary w-100 optionbutton">False</button></div>
                                            </div>
                                        </div>
                                }

                            </div>
                        </div> : null
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        quiz: state.pssReducer.quiz,
        liveStatus: state.pssReducer.liveStatus
    }
}


export default connect(mapStateToProps, { toggleLoader, changeLoaderText, getQuestions, getLiveStatus })(Home);

