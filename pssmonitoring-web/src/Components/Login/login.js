import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import $ from 'jquery';

import './login.css';

import avatar from '../../Assets/Image/avatar.png';


class Login extends Component {


    constructor(props) {
        console.log(document.styleSheets)
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
                                    <input type="text" className="form-control" name="username" placeholder="Email" required="required" />
                                </div>
                                <div className="form-group" hidden={this.state.initiateForgotPassword}>
                                    <input type={this.state.showPassword ? 'text' : 'password'} id="password" className="form-control" name="password" placeholder="Password" required="required" />
                                    <i className={this.state.showPassword ? 'fa fa-eye input-icon' : 'fa fa-eye-slash input-icon'} onClick={this.togglePassword.bind(this)} ></i>
                                </div>
                                <div className="form-group">
                                    <Button color="inherit" style={{
                                        'background-color': '#60c7c1', 'color': 'white',
                                        'font-weight': 'bold',
                                        'letter-spacing': ' 2.5px'
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


export default connect(null, null)(Login);

