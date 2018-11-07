import React, { Component } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Avatar from '@material-ui/core/Avatar';
import Popover from '@material-ui/core/Popover';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ScreenshotIcon from '@material-ui/icons/AddToQueue';
import WebCamIcon from '@material-ui/icons/LinkedCamera';
import SettingsIcon from '@material-ui/icons/Settings';
import History from '@material-ui/icons/History';
import deepOrange from '@material-ui/core/colors/deepOrange';

import './dashboard.css';
import remoteControl from '../../Assets/Image/remotecontrol.png';

import { removeTrigger, clearOldTabState, toggleLoader } from '../../Actions/pss.actions';
import { signOutUser, trackDeviceStatus, enableTriggerListener, stopAllListeners } from '../../Actions/api.actions';
import { notifyUser, notifyType, TriggerStatus, createMessage, loaderState, LockStatus, extractDate, extractTime } from '../../Utils/pss.helper';
import BrowserHistory from '../BrowserHistory/browserhistory';
import Webcam from '../Webcam/webcam';
import Screenshot from '../Screnshot/screenshot';
import Settings from '../Settings/settings';
import RemoteControl from '../RemoteControl/remotecontrol';
import Home from '../Home/home';

const drawerWidth = 220;

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: '100vh',
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    grow: {
        flexGrow: 1,
        'text-align': 'left',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: 0,
        [theme.breakpoints.up('sm')]: {
            width: 0,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    content: {
        overflowX: 'auto',
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
    },
    avatar: {
        margin: 10,
        'background-color': 'transparent'
    },
    badge: {
        top: 1,
        right: -15
    },
    orangeAvatar: {
        margin: 10,
        color: '#fff',
        backgroundColor: deepOrange[500],
    },
    popover: {
        pointerEvents: 'none',
    },
    paper: {
        padding: theme.spacing.unit,
    },
    typography: {
        margin: theme.spacing.unit * 2,
    },
});

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            profileButtonElement: null,
            deviceButtonElement: null,
            currentMenuItemSelected: 'Home'
        };
        this.props.userInfo ? this.initializeListeners() : this.props.history.push('/login');;

    }

    componentWillUnmount() {
        this.props.stopAllListeners();
    }

    componentDidUpdate(prevProps) {
        if (this.props.lock && !prevProps.lock) {
            if (this.props.lock.status === 1) {
                notifyUser('LOCKED', notifyType.warning);
            }
        } else if (this.props.lock && prevProps.lock) {
            if (prevProps.lock.status !== this.props.lock.status) {
                if (this.props.lock.status === 1) {
                    notifyUser('LOCKED', notifyType.warning);
                } else {
                    notifyUser('UNLOCKED', notifyType.warning);
                }
            }
        }
    }

    initializeListeners() {
        this.props.trackDeviceStatus(this.props.deviceInfo.deviceId);
        this.props.enableTriggerListener(this.props.deviceInfo.deviceId, this.props.userInfo);
    }

    handleDrawerOpen = () => {
        this.setState({ open: true });
    };

    handleDrawerClose = () => {
        this.setState({ open: false });
    };

    openPopper = event => {
        this.setState({
            profileButtonElement: event.currentTarget,
        });
    };

    handleClose = () => {
        this.setState({
            profileButtonElement: null,
        });
    };

    handlePopoverOpen = event => {
        this.setState({ deviceButtonElement: event.currentTarget });
    };

    handlePopoverClose = () => {
        this.setState({ deviceButtonElement: null });
    };

    handleDrawerItemClick = (item) => {
        if (item !== this.state.currentMenuItemSelected) {
            this.props.clearOldTabState(this.state.currentMenuItemSelected)
                .then(() => {
                    this.setState({ open: false, openDrawer: false, currentMenuItemSelected: item });
                })
        } else {
            this.handleDrawerClose();
        }
    }

    getUserInitials() {
        let userInitials = '';
        if (this.props.userInfo) {
            this.props.userInfo.name.split(' ').forEach((name) => {
                userInitials += name.charAt(0).toUpperCase();
            });
            return userInitials;
        }
    }

    handleSignout = () => {
        this.props.signOutUser().then(() => {
            this.props.history.push('/login');
        }).catch(() => {
            notifyUser('Something Went Wrong', notifyType.error);
        })
    }

    renderSelectedComponent() {
        if (this.props.deviceInfo) {
            switch (this.state.currentMenuItemSelected) {
                case 'Home':
                    return (<Home deviceId={this.props.deviceInfo.deviceId} />);
                case 'Browser History':
                    return (<BrowserHistory deviceId={this.props.deviceInfo.deviceId} />);
                case 'Webcam':
                    return (<Webcam deviceId={this.props.deviceInfo.deviceId} />);
                case 'Screenshot':
                    return (<Screenshot deviceId={this.props.deviceInfo.deviceId} />);
                case 'RemoteControl':
                    return (<RemoteControl deviceId={this.props.deviceInfo.deviceId} />);
                case 'Settings':
                    return (<Settings />);
                default:
            }
        } else {
            this.props.history.push('/login');
        }
    }

    render() {
        const { classes, theme } = this.props;
        const { profileButtonElement, deviceButtonElement } = this.state;
        const openProfilePopper = Boolean(profileButtonElement);
        const openDevicePopper = Boolean(deviceButtonElement);

        if (this.props.triggers && this.props.isTriggerLoaded) {
            Object.entries(this.props.triggers).forEach(
                ([key, data]) => {
                    // console.log(key, data)
                    switch (data.TriggerStatus) {
                        case TriggerStatus.SUCCESS:
                            notifyUser(createMessage(data.TriggerType, data.TriggerStatus), notifyType.success);
                            this.props.removeTrigger(key);
                            this.props.toggleLoader(loaderState.OFF);
                            break;
                        case TriggerStatus.FAILED:
                        case TriggerStatus.STOPPED:
                            notifyUser(createMessage(data.TriggerType, data.TriggerStatus), notifyType.error);
                            this.props.removeTrigger(key);
                            this.props.toggleLoader(loaderState.OFF);
                            break;
                        default:
                    }
                }
            );
        }

        return (
            <div className={classes.root}>
                <AppBar position="absolute" onClick={this.state.open ? this.handleDrawerClose : null} className={classNames(classes.appBar, this.state.open && classes.appBarShift)}>

                    <Toolbar disableGutters={!this.state.open}>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            onClick={this.handleDrawerOpen}
                            className={classNames(classes.menuButton, this.state.open && classes.hide)}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="title" color="inherit" className={classes.grow} noWrap>
                            {this.state.currentMenuItemSelected}
                        </Typography>

                        <Avatar className={classes.avatar} onMouseEnter={this.handlePopoverOpen}
                            onMouseLeave={this.handlePopoverClose}>

                            <i className="fa fa-laptop" aria-hidden="true"></i>
                            <span
                                className={"device-status animated infinite flash slower " + (!(this.props.deviceInfo && this.props.deviceInfo.isDevicePinging) ? 'offline' : '')}></span>
                        </Avatar>
                        <Avatar className={classes.orangeAvatar} onClick={this.openPopper}>{this.getUserInitials()}</Avatar>

                        <Popover
                            id="profile-popper"
                            open={openProfilePopper}
                            anchorEl={profileButtonElement}
                            onClose={this.handleClose}
                            style={{ cursor: 'pointer' }}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}>
                            <Typography className={classes.typography} onClick={this.handleSignout}><i className="fa fa-sign-out" aria-hidden="true"></i> Logout</Typography>
                        </Popover>


                        <Popover
                            id="device-popover"
                            className={classes.popover}
                            classes={{
                                paper: classes.paper,
                            }}
                            open={openDevicePopper}
                            anchorEl={deviceButtonElement}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                            onClose={this.handlePopoverClose}
                            disableRestoreFocus>
                            <Typography>{this.props.deviceInfo ? this.props.deviceInfo.deviceName : ''}</Typography>
                        </Popover>

                    </Toolbar>
                </AppBar>


                <Drawer variant="persistent"
                    classes={{ paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose) }} open={this.state.open}>

                    <div className={classes.toolbar}>
                        <IconButton onClick={this.handleDrawerClose}>
                            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </div>

                    <List>
                        <Divider />
                        <ListItem button onClick={this.handleDrawerItemClick.bind(this, 'Home')}>
                            <ListItemIcon>
                                <i className="fa fa-home mr-0" aria-hidden="true"></i>
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItem>

                        <ListItem button onClick={this.handleDrawerItemClick.bind(this, 'Browser History')}>
                            <ListItemIcon>
                                <History style={{ marginRight: 0 }} />
                            </ListItemIcon>
                            <ListItemText primary="Broswer History" />
                        </ListItem>

                        <ListItem button onClick={this.handleDrawerItemClick.bind(this, 'Webcam')}>
                            <ListItemIcon>
                                <WebCamIcon style={{ marginRight: 0 }} />
                            </ListItemIcon>
                            <ListItemText primary="Webcam" />
                        </ListItem>

                        <ListItem button onClick={this.handleDrawerItemClick.bind(this, 'Screenshot')}>
                            <ListItemIcon>
                                <ScreenshotIcon style={{ marginRight: 0 }} />
                            </ListItemIcon>
                            <ListItemText primary="Screenshot" />
                        </ListItem>

                        <ListItem button onClick={this.handleDrawerItemClick.bind(this, 'RemoteControl')}>
                            <ListItemIcon>
                                <img src={remoteControl} alt="remote-icon" className="mr-0" />
                            </ListItemIcon>
                            <ListItemText primary="RemoteControl" />
                        </ListItem>


                        <ListItem button onClick={this.handleDrawerItemClick.bind(this, 'Settings')}>
                            <ListItemIcon>
                                <SettingsIcon style={{ marginRight: 0 }} />
                            </ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItem>
                    </List>
                </Drawer>
                <main className={`${classes.content} scroll4 animated ${this.state.open ? 'fadeOut fastest' : 'fadeIn fastest'}`} onClick={this.state.open ? this.handleDrawerClose : null} >
                    <div className={classes.toolbar} />
                    {this.renderSelectedComponent()}
                </main>
                {this.props.lock && this.props.lock.status === LockStatus.LOCK ?
                    <div className="footer">
                        <p>{`DEVICE LOCKED BY ${this.props.lock.user.name.toUpperCase()} ON ${extractDate(this.props.lock.timestamp)}@${extractTime(this.props.lock.timestamp)}`}</p>
                    </div>
                    : null}

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.pssReducer.userInfo,
        deviceInfo: state.pssReducer.deviceInfo,
        triggers: state.pssReducer.triggers,
        isTriggerLoaded: state.pssReducer.isTriggerLoaded,
        lock: state.pssReducer.lock
    }
}

export default compose(
    withStyles(styles, { withTheme: true }),
    connect(mapStateToProps, { signOutUser, trackDeviceStatus, enableTriggerListener, removeTrigger, clearOldTabState, stopAllListeners, toggleLoader })
)(Dashboard);