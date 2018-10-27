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
import Screenshot from '@material-ui/icons/AddToQueue';
import WebCamIcon from '@material-ui/icons/LinkedCamera';
import Settings from '@material-ui/icons/Settings';
import History from '@material-ui/icons/History';
import deepOrange from '@material-ui/core/colors/deepOrange';

import './dashboard.css';
import remoteControl from '../../Assets/Image/remotecontrol.png';

import { signOutUser, trackDeviceStatus, stopAllListeners } from '../../Actions/api.actions';
import { notifyUser, notifyType } from '../../Utils/pss.helper';
import BrowserHistory from '../BrowserHistory/browserhistory';
import Webcam from '../Webcam/webcam';

const drawerWidth = 240;

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
        this.props.userInfo ? this.props.trackDeviceStatus(this.props.deviceInfo.deviceId) : this.props.history.push('/login');
    }

    componentWillUnmount() {
        this.props.stopAllListeners();
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
        this.setState({ open: false, openDrawer: false, currentMenuItemSelected: item ? item : 'Dashboard' });
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
                // case 'Home':
                //     return (<div>Home</div>);
                case 'Browser History':
                    return (<BrowserHistory deviceId={this.props.deviceInfo.deviceId} />);
                case 'Webcam':
                    return (<Webcam deviceId={this.props.deviceInfo.deviceId} />);
                // case 'Screenshot':
                //     return (<Screenshot />);
                // case 'RemoteControl':
                //     return (<RemoteControl />);
                // case 'Settings':
                //     return (<Settings />);
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
                                <i className="fa fa-home" aria-hidden="true"></i>
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItem>

                        <ListItem button onClick={this.handleDrawerItemClick.bind(this, 'Browser History')}>
                            <ListItemIcon>
                                <History />
                            </ListItemIcon>
                            <ListItemText primary="Broswer History" />
                        </ListItem>

                        <ListItem button onClick={this.handleDrawerItemClick.bind(this, 'Webcam')}>
                            <ListItemIcon>
                                <WebCamIcon />
                            </ListItemIcon>
                            <ListItemText primary="Webcam" />
                        </ListItem>

                        <ListItem button onClick={this.handleDrawerItemClick.bind(this, 'Screenshot')}>
                            <ListItemIcon>
                                <Screenshot />
                            </ListItemIcon>
                            <ListItemText primary="Screenshot" />
                        </ListItem>

                        <ListItem button onClick={this.handleDrawerItemClick.bind(this, 'RemoteControl')}>
                            <ListItemIcon>
                                <img src={remoteControl} alt="remote-icon" />
                            </ListItemIcon>
                            <ListItemText primary="RemoteControl" />
                        </ListItem>


                        <ListItem button onClick={this.handleDrawerItemClick.bind(this, 'Settings')}>
                            <ListItemIcon>
                                <Settings />
                            </ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItem>
                    </List>
                </Drawer>
                <main className={`${classes.content} scroll4`} onClick={this.state.open ? this.handleDrawerClose : null} >
                    <div className={classes.toolbar} />
                    {this.renderSelectedComponent()}
                </main>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userInfo: state.pssReducer.userInfo,
        deviceInfo: state.pssReducer.deviceInfo
    }
}

export default compose(
    withStyles(styles, { withTheme: true }),
    connect(mapStateToProps, { signOutUser, trackDeviceStatus, stopAllListeners })
)(Dashboard);