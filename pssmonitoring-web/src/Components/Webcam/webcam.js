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

import { toggleLoader, changeLoaderText } from '../../Actions/pss.actions';
import { addTrigger, getWebcamImages, checkIfExist } from '../../Actions/api.actions';
import { notifyUser, notifyType, loaderState, loadingHints, createTrigger, TriggerType, extractDate, extractTime } from '../../Utils/pss.helper';

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

    componentDidMount() {
        this.props.toggleLoader(loaderState.ON, loadingHints[Math.floor(Math.random() * loadingHints.length)]);
        this.loaderInterval = setInterval(() => {
            this.props.changeLoaderText(loadingHints[Math.floor(Math.random() * loadingHints.length)]);
        }, 1500);
        this.props.checkIfExist(`Devices/${this.props.deviceInfo.deviceId}/Webcam/${extractDate()}@${extractTime()}`, 'value')
            .then(() => {
                this.props.getWebcamImages(this.props.deviceId, this.props.userInfo);
            }).catch(() => {
                this.props.toggleLoader(loaderState.OFF);
                clearInterval(this.loaderInterval);
                notifyUser('No Images Found', notifyType.info);
            });
    }


    handleDialogClose = () => {
        this.setState({
            openDialog: false
        })
    }
    handleDialogOpen = () => {
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
        this.props.addTrigger(this.props.deviceId, createTrigger(TriggerType.TAKEPICTURE, this.props.userInfo))
            .then(() => {
                notifyUser('Successfully Sent Request For Webcam Picture', notifyType.success);

                const loaderInterval = setInterval(() => {
                    this.props.changeLoaderText(loadingHints[Math.floor(Math.random() * loadingHints.length)]);
                }, 1500);

                setTimeout(() => {
                    clearInterval(loaderInterval);
                    if (this.props.showLoader) {
                        this.props.toggleLoader(loaderState.OFF);
                        notifyUser('Will notify you once picture is loaded', notifyType.success);
                    }
                }, 15000);
            })
            .catch(() => {
                notifyUser('Something Went Wrong', notifyType.error);
            });
    }

    openImage(event) {
        var image = new Image();
        image.src = event.target.src;
        var w = window.open("");
        w.document.write(image.outerHTML);
    }

    render() {
        if (this.props.webcamImages.length > 0 && this.props.showLoader) {
            this.props.toggleLoader(loaderState.OFF);
            clearInterval(this.loaderInterval);
        }
        return (
            <div>
                <Dialog
                    open={this.state.openDialog}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={this.handleDialogClose}
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
                        <Button onClick={this.handleDialogClose} color="primary">
                            Disagree
                        </Button>
                        <Button onClick={this.handleCapture} color="primary">
                            Agree
                        </Button>
                    </DialogActions>
                </Dialog>

                <div className="image-container mt-lg-4 mt-0 mb-sm-5 mb-0">
                    <img src={webcamIcon} onClick={this.handleDialogOpen} className="image" alt="imageicon"/>
                </div>

                <div className="container-fluid">
                    <div className="row">
                        {
                            this.props.webcamImages.map((image) => {
                                return (
                                    <div className="col-12 col-sm-6 col-md-4 mb-sm-4 mb-2 p-4 p-sm-2 animated fadeIn" key={image.snapshot.key}>
                                        <div className="card shadow">
                                            <img className="card-img-top p-2" onClick={this.openImage.bind(this)} src={image.snapshot.data} alt="img" />
                                            <div className="card-body text-center">
                                                <h5 className="card-title">{extractDate() + '@' + extractTime(image.timestamp)}</h5>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.pssReducer.userInfo,
        deviceInfo: state.pssReducer.deviceInfo,
        showLoader: state.pssReducer.showLoader,
        webcamImages: state.pssReducer.webcamImages
    }
}


export default connect(mapStateToProps, { toggleLoader, changeLoaderText, addTrigger, getWebcamImages, checkIfExist })(Webcam);

