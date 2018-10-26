import React, { Component } from 'react';
import { connect } from 'react-redux';
import SearchIcon from '@material-ui/icons/SearchOutlined'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';

import './browserhistory.css';

import GoogleChrome from '../../Assets/Image/Google Chrome.svg';
import InternetExplorer from '../../Assets/Image/Internet Explorer.svg';
import MicrosoftEdge from '../../Assets/Image/Microsoft Edge.svg';
import MozillaFirefox from '../../Assets/Image/Mozilla Firefox.svg';
import Opera from '../../Assets/Image/Opera.svg';
import Safari from '../../Assets/Image/Safari.svg';


import { getBrowserHistory } from '../../Actions/api.actions';
import { toggleLoader } from '../../Actions/pss.actions';
import { loaderState } from '../../Utils/pss.helper';

class BrowserHistory extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        this.props.toggleLoader(loaderState.ON, 'Loading Browser Histories');
        this.props.getBrowserHistory(this.props.deviceId);
    }

    componentWillReceiveProps() {
        if (this.props.browserHistory && this.state.isLoading) {
            this.setState({ isLoading: false });
            this.props.toggleLoader(loaderState.OFF);
        }
    }

    extractTime(timestamp) {
        const date = new Date(timestamp);
        const currentTime = date.getHours() + ":"
            + date.getMinutes() + ":"
            + date.getSeconds();

        return currentTime;
    }

    extractDate(timestamp) {
        const date = new Date(timestamp);
        const currentDate = date.getDate() + "-"
            + (date.getMonth() + 1) + "-"
            + date.getFullYear();

        return currentDate;
    }

    getBrowserIcon(browserType) {
        switch (browserType) {
            case 'GoogleChrome':
                return <img src={GoogleChrome} alt={browserType} />
            case 'InternetExplorer':
                return <img src={InternetExplorer} alt={browserType} />
            case 'MicrosoftEdge':
                return <img src={MicrosoftEdge} alt={browserType} />
            case 'MozillaFirefox':
                return <img src={MozillaFirefox} alt={browserType} />
            case 'Opera':
                return <img src={Opera} alt={browserType} />
            case 'Safari':
                return <img src={Safari} alt={browserType} />
            default:
                return browserType
        }

    }


    render() {
        let uniqueDates = [];
        if (this.props.browserHistory) {
            const dates = [];
            this.props.browserHistory.forEach((history, index) => {
                dates.push(this.extractDate(history.utc_time));
                if (index === this.props.browserHistory.length - 1) {
                    uniqueDates = [...new Set(dates)];
                }
            });
        }
        return (
            <div>
                <div className="mb-5 row">
                    <TextField
                        id="fromDate"
                        label="From"
                        type="date"
                        className="col-3 filter"
                        defaultValue=""
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        id="toDate"
                        label="To"
                        type="date"
                        className="col-3 filter"
                        defaultValue=""
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <Button variant="contained" className="filter search-button" size="small" >
                        <SearchIcon style={{ fontSize: 20 }} />
                        Search
                    </Button>
                </div>
                {uniqueDates.map((date, index) => {
                    let count = 0;
                    return (
                        <div className="accordion" id={'accordion' + index} key={index}>
                            <div className="card shadow mb-4">
                                <div className="card-header text-center" id={'heading' + index}>
                                    <span className="font-weight-bold date">{date}</span>
                                    <div className="float-right cursor" data-toggle="collapse" data-target={'#collapse' + index} aria-expanded="true" aria-controls={'#' + index} >
                                        <KeyboardArrowDown />
                                        {/* <KeyboardArrowUp fontSize="large" /> */}
                                    </div>
                                </div>
                                <div className="collapse" id={'collapse' + index} aria-labelledby={'heading' + index} data-parent={'#accordion' + index}>
                                    <div className="card-body p-0 scroll4 table-container">
                                        <table className="table table-bordered mb-0">
                                            <thead className="text-center">
                                                <tr>
                                                    <th scope="col">#</th>
                                                    <th scope="col">Website</th>
                                                    <th scope="col">Link</th>
                                                    <th scope="col">Time</th>
                                                    <th scope="col">Browser</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.props.browserHistory.map((history) => {
                                                    if (this.extractDate(history.utc_time) === date) {
                                                        return (
                                                            <tr key={history.hash}>
                                                                <th scope="row" className="text-center v-align">{++count}</th>
                                                                <td className="v-align"><div className="scroll4">{history.title}</div></td>
                                                                <td className="v-align"><div className="scroll4">{history.url}</div></td>
                                                                <td className="v-align text-center"><div className="scroll4">{this.extractTime(history.utc_time)}</div></td>
                                                                <td className="v-align text-center"><div className="scroll4">{this.getBrowserIcon(history.browser.replace(/\s/g, ''))}</div></td>
                                                            </tr>
                                                        );
                                                    }
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        browserHistory: state.pssReducer.browserHistory,
    }
}

export default connect(mapStateToProps, { getBrowserHistory, toggleLoader })(BrowserHistory);