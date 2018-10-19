import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import $ from 'jquery';

import './login.css';

import avatar from '../../Assets/Image/avatar.png';

import { notifyUser, notifyType, validateUserInputs, emailRegex, loaderState } from '../../Utils/pss.helper';
import { toggleLoader } from '../../Actions/pss.actions';

class Login extends Component {


    constructor(props) {
        super(props);
        this.state = {
            showPassword: false,
            initiateForgotPassword: false
        };
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
            } else {
                notifyUser('Please Enter Valid Email Id', notifyType.error);
            }
        } else {
            if (this.state.email && this.state.password && validateUserInputs(this.state.email, emailRegex)) {
                this.props.toggleLoader(loaderState.ON, 'Logging In...');
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
                                    <input type="text" id="email" className="form-control" name="email" placeholder="Email" required="required"
                                        onKeyUp={this.detectEnterEvent.bind(this)} onChange={this.handleInputChange.bind(this)} onPaste={this.handleInputChange.bind(this)} />
                                </div>
                                <div className="form-group" hidden={this.state.initiateForgotPassword}>
                                    <input type={this.state.showPassword ? 'text' : 'password'} id="password" className="form-control" name="password" placeholder="Password" required="required"
                                        onKeyUp={this.detectEnterEvent.bind(this)} onChange={this.handleInputChange.bind(this)} onPaste={this.handleInputChange.bind(this)}
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
                            <a onClick={this.toggleForgotPassword.bind(this)}>
                                {this.state.initiateForgotPassword ? 'Click to Login' : 'Forgot Password?'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(null, { toggleLoader })(Login);

