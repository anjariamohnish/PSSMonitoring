import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
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
import WebCam from '@material-ui/icons/LinkedCamera';
import Settings from '@material-ui/icons/Settings';
import History from '@material-ui/icons/History';

import deepOrange from '@material-ui/core/colors/deepOrange';

import './navbar.css';
import remoteControl from '../../../../Assets/Image/remotecontrol.png'


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
        width: theme.spacing.unit * 7,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9,
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

class NavBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            profileButtonElement: null,
            deviceButtonElement: null
        };
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

    render() {
        const { classes, theme } = this.props;
        const { profileButtonElement, deviceButtonElement } = this.state;
        const openProfilePopper = Boolean(profileButtonElement);
        const openDevicePopper = Boolean(deviceButtonElement);

        return (
            <div className={classes.root}>
                <AppBar position="absolute" className={classNames(classes.appBar, this.state.open && classes.appBarShift)}>

                    <Toolbar disableGutters={!this.state.open}>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            onClick={this.handleDrawerOpen}
                            className={classNames(classes.menuButton, this.state.open && classes.hide)}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="title" color="inherit" className={classes.grow} noWrap>
                            Dashboard
                        </Typography>

                        <Avatar className={classes.avatar} onMouseEnter={this.handlePopoverOpen}
                            onMouseLeave={this.handlePopoverClose}>

                            <i className="fa fa-laptop" aria-hidden="true"></i>
                            <span className="device-status animated infinite  flash slower"></span>
                        </Avatar>
                        <Avatar className={classes.orangeAvatar} onClick={this.openPopper}>PV</Avatar>

                        <Popover
                            id="profile-popper"
                            open={openProfilePopper}
                            anchorEl={profileButtonElement}
                            onClose={this.handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}>
                            <Typography className={classes.typography}><i className="fa fa-sign-out" aria-hidden="true"></i> Logout</Typography>
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
                            <Typography>HP</Typography>
                        </Popover>

                    </Toolbar>
                </AppBar>


                <Drawer variant="permanent"
                    classes={{ paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose) }} open={this.state.open}>

                    <div className={classes.toolbar}>
                        <IconButton onClick={this.handleDrawerClose}>
                            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </div>

                    <Divider />
                    <List>
                        <ListItem button>
                            <ListItemIcon>
                                <i className="fa fa-home" aria-hidden="true"></i>
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItem>

                        <ListItem button>
                            <ListItemIcon>
                                <History />
                            </ListItemIcon>
                            <ListItemText primary="Broswer History" />
                        </ListItem>

                        <ListItem button>
                            <ListItemIcon>
                                <WebCam />
                            </ListItemIcon>
                            <ListItemText primary="Webcam" />
                        </ListItem>

                        <ListItem button>
                            <ListItemIcon>
                                <Screenshot />
                            </ListItemIcon>
                            <ListItemText primary="Screenshot" />
                        </ListItem>

                        <ListItem button>
                            <ListItemIcon>
                                <img src={remoteControl} />
                            </ListItemIcon>
                            <ListItemText primary="RemoteControl" />
                        </ListItem>


                        <ListItem button>
                            <ListItemIcon>
                                <Settings />
                            </ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItem>
                    </List>
                </Drawer>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    {/* main content goes here */}
                </main>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(NavBar);