import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Lock_Open from '@material-ui/icons/LockOpenOutlined';
import Lock from '@material-ui/icons/LockOutlined'
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';


import './settings.css';


import { toggleLoader, changeLoaderText } from '../../Actions/pss.actions';
import { LockStatus, loaderState, loadingHints, notifyUser, notifyType } from '../../Utils/pss.helper';


function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class Settings extends Component {


    constructor(props) {
        super(props);
        this.state = {
            isLocked: false,
            showPassword: false,
            pin: '',
            openDialog: false,
            canUserToggleLock: false
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.lock && this.props.lock.status !== prevProps.lock.status) {
            this.setStatebyLock(this.props.lock);
        }
    }

    componentDidMount() {
        this.setStatebyLock(this.props.lock);
    }

    setStatebyLock(lock) {
        if (lock.status === LockStatus.UNLOCKED) {
            this.setState({
                isLocked: false,
                pin: '',
                canUserToggleLock: true
            })
        } else if (lock.status === LockStatus.LOCK) {
            this.setState({
                isLocked: true,
                pin: '',
                canUserToggleLock: this.props.userInfo.uid === lock.user.uid ? true : false,
                openDialog: this.props.userInfo.uid === lock.user.uid ? false : true
            });
        }
    }

    handleChange = prop => event => {
        if (prop === 'pin') {
            this.setState({
                pin: event.target.value.replace(/\D/, '') // check for non number
            })
        }

    }

    togglePassword() {
        this.setState({ showPassword: !this.state.showPassword })
    }

    handleSubmit() {
        if (new String(this.state.pin).length === 6) {
            this.props.toggleLoader(loaderState.ON, loadingHints[Math.floor(Math.random() * loadingHints.length)]);
            this.loaderInterval = setInterval(() => {
                this.props.changeLoaderText(loadingHints[Math.floor(Math.random() * loadingHints.length)]);
            }, 1500);
            
        } else {
            notifyUser('Enter 6 Digit Pin', notifyType.warning);
        }


    }

    handleClose = () => {
        this.setState({ openDialog: false });
    };


    render() {
        return (
            <div>
                <div className="card shadow mt-5">
                    <div className="card-header text-center">
                        Lock System
                     </div>
                    <div className="card-body">
                        <div className="container">
                            <div className="row">
                                <div className="col-12 text-center">
                                    <FormControl style={{ maxWidth: '150px' }}>
                                        <InputLabel htmlFor="adornment-password">PIN</InputLabel>
                                        <Input
                                            id="adornment-password"
                                            disabled={!this.state.canUserToggleLock}
                                            type={this.state.showPassword ? 'text' : 'password'}
                                            value={this.state.pin}
                                            inputProps={{ maxLength: 6 }}
                                            onChange={this.handleChange('pin')}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="Toggle password visibility"
                                                        onClick={this.togglePassword.bind(this)}
                                                    >
                                                        {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                        />
                                    </FormControl>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 text-center mt-5">
                                    <Button variant="extendedFab"
                                        color="primary"
                                        style={{ width: '125px' }}
                                        aria-label="ToggleLock"
                                        disabled={!this.state.canUserToggleLock}
                                        onClick={this.handleSubmit.bind(this)}>
                                        {this.state.isLocked ? <Lock style={{ marginRight: '10px' }} /> : <Lock_Open style={{ marginRight: '10px' }} />}
                                        {this.state.isLocked ? 'Unlock' : 'Lock'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Dialog
                    open={this.state.openDialog}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle id="alert-dialog-slide-title" style={{ textAlign: "center" }}>
                        Warning
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            This Device is locked by Sushmita Tunwal on 12-15-10 10:15:15pm, only she can unlock the device
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.pssReducer.userInfo,
        lock: state.pssReducer.lock
    }
}


export default connect(mapStateToProps, { toggleLoader, changeLoaderText })(Settings);

