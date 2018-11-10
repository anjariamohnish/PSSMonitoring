import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import $ from 'jquery';

import './login.css';

import avatar from '../../Assets/Image/avatar.png';

import { notifyUser, notifyType, validateUserInputs, emailRegex, loaderState } from '../../Utils/pss.helper';
import { toggleLoader } from '../../Actions/pss.actions';
import { loginUser, sendForgotPasswordMail } from '../../Actions/api.actions';

class Login extends Component {


    constructor(props) {
        super(props);
        this.state = {
            showPassword: false,
            initiateForgotPassword: false
        };
        if (this.props.userInfo) {
            this.props.history.push('/dashboard')
        }
    }

    togglePassword() {
        $('#password').focus();
        this.setState({
            showPassword: !this.state.showPassword
        })
    }

    toggleForgotPassword() {
        this.setState({
            initiateForgotPassword: !this.state.initiateForgotPassword
        })
    }

    handleSubmit() {
        if (this.state.initiateForgotPassword) {
            if (this.state.email && validateUserInputs(this.state.email, emailRegex)) {
                this.props.toggleLoader(loaderState.ON, 'Sending Password Recovery Mail...');
                this.props.sendForgotPasswordMail(this.state.email)
                    .then(() => {
                        notifyUser('Password Recovery Mail has been sent successfully', notifyType.success);
                        this.setState({ initiateForgotPassword: false, email: '' });
                    })
                    .catch((err) => {
                        if (err.code === 'auth/user-not-found') {
                            notifyUser('No Such Email/User Exist in our System', notifyType.error);
                        } else {
                            notifyUser(err.message, notifyType.error);
                        }
                    })
                    .then(() => {
                        this.props.toggleLoader(loaderState.OFF);
                    })
            } else {
                notifyUser('Please Enter Valid Email Id', notifyType.error);
            }
        } else {
            if (this.state.email && this.state.password && validateUserInputs(this.state.email, emailRegex)) {
                this.props.toggleLoader(loaderState.ON, 'Logging In...');
                this.props.loginUser({ email: this.state.email, password: this.state.password })
                    .then(() => {
                        notifyUser('Logged In Successfully', notifyType.success);
                        this.props.toggleLoader(loaderState.OFF);
                        this.props.history.push('/dashboard');
                    })
                    .catch(() => {
                        this.setState({ password: '' });
                        this.props.toggleLoader(loaderState.OFF);
                    })
            } else {
                notifyUser('Please Check your Credentials', notifyType.error);
            }
        }
    }

    handleInputChange(event) {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    detectEnterEvent(event) {
        if (event.keyCode === 13) {
            this.handleSubmit();
        }
    }

    render() {
        return (
            <div id="loginModal" className="modal fade show">
                <div className="modal-dialog modal-login  modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="avatar">
                                <img src={avatar} alt="Avatar" />
                            </div>
                            <h4 className="modal-title">
                                {this.state.initiateForgotPassword ? 'Whats my Password ?' : 'Member Login'}
                            </h4>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="form-group">
                                    <input type="text" id="email" className="form-control" name="email" placeholder="Email"
                                        onKeyUp={this.detectEnterEvent.bind(this)} onChange={this.handleInputChange.bind(this)} onPaste={this.handleInputChange.bind(this)} />
                                </div>
                                <div className="form-group" hidden={this.state.initiateForgotPassword}>
                                    <input type={this.state.showPassword ? 'text' : 'password'} id="password" className="form-control" name="password" placeholder="Password" autoComplete="true"
                                        onKeyUp={this.detectEnterEvent.bind(this)} value={this.state.password ? this.state.password : ''} onChange={this.handleInputChange.bind(this)} onPaste={this.handleInputChange.bind(this)}
                                    />
                                    <i className={this.state.showPassword ? 'fa fa-eye input-icon' : 'fa fa-eye-slash input-icon'} onClick={this.togglePassword.bind(this)} ></i>
                                </div>
                                <div className="form-group">
                                    <Button color="inherit"
                                        onClick={this.handleSubmit.bind(this)}
                                        style={{
                                            fontWeight: "bold",
                                            backgroundColor: "#60c7c1",
                                            color: "white",
                                            letterSpacing: "2.5px"
                                        }}
                                        fullWidth={true} variant="contained" >
                                        {this.state.initiateForgotPassword ? 'Send Mail' : 'Login'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <a className="hvr-grow" onClick={this.toggleForgotPassword.bind(this)}>
                                {this.state.initiateForgotPassword ? 'Click to Login' : 'Forgot Password?'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.pssReducer.userInfo,
    }
}


export default connect(mapStateToProps, { toggleLoader, loginUser, sendForgotPasswordMail })(Login);

