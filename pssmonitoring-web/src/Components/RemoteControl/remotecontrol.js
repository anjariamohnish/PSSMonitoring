import React, { Component } from 'react';
import { connect } from 'react-redux';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

import checkmark from '../../Assets/Image/checkmark.png';
import crossmark from '../../Assets/Image/crossmark.png';
import exclamationmark from '../../Assets/Image/exclamationmark.png';
import loadingIcon from '../../Assets/Image/loading.svg';

import './remotecontrol.css';


import { toggleLoader, changeLoaderText } from '../../Actions/pss.actions';
import { TriggerType, createTrigger, notifyUser, loadingHints, notifyType, loaderState, extractDate, extractTime, TriggerStatus } from '../../Utils/pss.helper';
import { addTrigger, getCommands } from '../../Actions/api.actions';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class RemoteControl extends Component {


    constructor(props) {
        super(props);
        this.state = {
            command: '',
            commandText: '',
            openDialog: false
        }
    }

    componentDidMount() {
        this.props.toggleLoader(loaderState.ON, loadingHints[Math.floor(Math.random() * loadingHints.length)]);
        this.initialLoaderInterval = setInterval(() => {
            this.props.changeLoaderText(loadingHints[Math.floor(Math.random() * loadingHints.length)]);
        }, 1500);
        this.props.getCommands(this.props.deviceId, this.props.userInfo);

        setTimeout(() => {
            this.props.toggleLoader(loaderState.OFF);
            clearInterval(this.initialLoaderInterval);
        }, 5000)
    }

    componentDidUpdate(prevProps) {
        if (Object.keys(this.props.commands).length > 0 && Object.keys(prevProps.commands).length === 0) {
            clearInterval(this.initialLoaderInterval);
            this.props.toggleLoader(loaderState.OFF);
        }
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value, commandText: this.getCommandText(event.target.value) });
    };

    getCommandText(type) {
        switch (type) {
            case TriggerType.SHUTDOWN:
                return 'Shutdown';
            case TriggerType.RESTART:
                return 'Restart';
            case TriggerType.LOCK:
                return 'Lock';
            case TriggerType.SIGNOUT:
                return 'Signout';

            case TriggerType.SHOW_MESSAGE:
                return 'Send Message';
        }
    }

    getImageByStatus(status) {
        switch (status) {
            case TriggerStatus.PENDING:
                return loadingIcon;
            case TriggerStatus.SUCCESS:
                return checkmark;
            case TriggerStatus.FAILED:
                return crossmark;
            case TriggerStatus.STOPPED:
                return exclamationmark;
        }
    }

    handleClose = () => {
        this.setState({ openDialog: false });
    };

    executeCommand = () => {
        this.props.toggleLoader(loaderState.ON, loadingHints[Math.floor(Math.random() * loadingHints.length)]);
        const loaderInterval = setInterval(() => {
            this.props.changeLoaderText(loadingHints[Math.floor(Math.random() * loadingHints.length)]);
        }, 1500);
        this.props.addTrigger(this.props.deviceId, createTrigger(this.state.command, this.props.userInfo))
            .then(() => {
                notifyUser(`Successfully Sent Command For ${this.state.commandText}`, notifyType.success);
            })
            .catch(() => {
                notifyUser('Something Went Wrong', notifyType.error);
            })
            .then(() => {
                this.props.toggleLoader(loaderState.OFF);
                clearInterval(loaderInterval);
                this.setState({
                    command: '',
                    commandText: '',
                    openDialog: false
                })
            })
    }


    render() {
        return (
            <div >
                <div className="card shadow">
                    <div className="card-body">
                        <div className="float-left">
                            <FormControl style={{ minWidth: 120 }}>
                                <InputLabel htmlFor="command-auto-width">Commands</InputLabel>
                                <Select
                                    value={this.state.command}
                                    onChange={this.handleChange}
                                    input={<Input name="command" id="command-auto-width" />}
                                    autoWidth>
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    <MenuItem value={TriggerType.SHUTDOWN}>Shutdown</MenuItem>
                                    <MenuItem value={TriggerType.RESTART}>Restart</MenuItem>
                                    <MenuItem value={TriggerType.LOCK}>Lock</MenuItem>
                                    <MenuItem value={TriggerType.SIGNOUT}>Signout</MenuItem>
                                    <MenuItem value={TriggerType.SHOW_MESSAGE}>Send Message</MenuItem>
                                </Select>
                                <FormHelperText>Select Commands & Fire Them</FormHelperText>
                            </FormControl>
                        </div>
                        <div className="float-right mt-4">
                            <Button size="small" onClick={() => { this.setState({ openDialog: this.state.command !== '' ? true : false }) }} variant="contained">
                                Fire Command
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="card shadow mt-4">
                    <div className="card-body p-0">
                        <table className="table table-bordered mb-0 text-center">
                            <thead>
                                <tr>
                                    <th scope="col">Command</th>
                                    <th scope="col">Date/Time</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    Object.keys(this.props.commands).map((key) => {
                                        const command = this.props.commands[key];
                                        return (
                                            <tr key={key}>
                                                <td className="v-align">{this.getCommandText(command.TriggerType)}</td>
                                                <td className="v-align">{`${extractDate(command.Timestamp)} ${extractTime(command.Timestamp)}`}</td>
                                                <td><img src={this.getImageByStatus(command.TriggerStatus)} height="36px" alt="status" /> </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
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
                    <DialogTitle id="alert-dialog-slide-title">
                        Confirmation
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            {`Do you want to ${this.state.commandText}`}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.executeCommand} color="primary">
                            Continue
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.pssReducer.userInfo,
        commands: state.pssReducer.commands
    }
}


export default connect(mapStateToProps, { toggleLoader, addTrigger, getCommands, changeLoaderText })(RemoteControl);

