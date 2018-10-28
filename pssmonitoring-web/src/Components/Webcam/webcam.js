import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';

import './webcam.css';

import webcamIcon from '../../Assets/Image/webcam.svg';

import { toggleLoader } from '../../Actions/pss.actions';
import { capturePicture } from '../../Actions/api.actions';
import { notifyUser, notifyType, loaderState, loadingHints, createTrigger, TriggerType } from '../../Utils/pss.helper';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class Webcam extends Component {


    constructor(props) {
        super(props);
        this.state = {
            openDialog: false
        }

    }

    handleClose = () => {
        this.setState({
            openDialog: false
        })
    }
    handleOpen = () => {
        this.setState({
            openDialog: true
        })
    }

    handleCapture = () => {
        this.setState({
            openDialog: false
        })
        notifyUser('Agreement Accepted', notifyType.success);
        this.props.toggleLoader(loaderState.ON, loadingHints[Math.floor(Math.random() * loadingHints.length)]);
        this.props.capturePicture(this.props.deviceId, createTrigger(TriggerType.TAKEPICTURE, this.props.userInfo))
            .then(() => {
                notifyUser('Successfully Sent Request For Webcam Picture', notifyType.success);

                const loaderInterval = setInterval(() => {
                    this.props.toggleLoader(loaderState.ON, loadingHints[Math.floor(Math.random() * loadingHints.length)]);
                }, 1500);

                setTimeout(() => {
                    clearInterval(loaderInterval);
                    notifyUser('Will notify you once picture is loaded', notifyType.success);
                    this.props.toggleLoader(loaderState.OFF);
                }, 10000);
            })
            .catch(() => {
                notifyUser('Something Went Wrong', notifyType.error);
            });
    }

    render() {
        return (
            <div>

                <Dialog
                    open={this.state.openDialog}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description">
                    <DialogTitle id="alert-dialog-slide-title">
                        {"Use Webcam service?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            You agree to use the External Services at your sole risk. Licensor is not responsible for examining or evaluating the content
                            or accuracy of any third-party External Services, and shall not be liable for any such third-party External Services.
                            Data displayed by any Licensed Application or External Service, including but not limited to financial, medical and location information, is for general informational purposes only and is not guaranteed by Licensor or its agents
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Disagree
                        </Button>
                        <Button onClick={this.handleCapture} color="primary">
                            Agree
                        </Button>
                    </DialogActions>
                </Dialog>

                <div className="image-container mt-5">
                    <img src={webcamIcon} onClick={this.handleOpen} className="image" />
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


export default connect(mapStateToProps, { toggleLoader, capturePicture })(Webcam);

