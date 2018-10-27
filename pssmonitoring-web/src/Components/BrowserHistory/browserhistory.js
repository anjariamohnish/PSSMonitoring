import React, { Component } from 'react';
import { connect } from 'react-redux';
import SearchIcon from '@material-ui/icons/SearchOutlined'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import $ from 'jquery';

import './browserhistory.css';

import GoogleChrome from '../../Assets/Image/Google Chrome.svg';
import InternetExplorer from '../../Assets/Image/Internet Explorer.svg';
import MicrosoftEdge from '../../Assets/Image/Microsoft Edge.svg';
import MozillaFirefox from '../../Assets/Image/Mozilla Firefox.svg';
import Opera from '../../Assets/Image/Opera.svg';
import Safari from '../../Assets/Image/Safari.svg';
import FilterIcon from '../../Assets/Image/filtericon.svg';

import { getBrowserHistory, getBrowserHistoryByDate } from '../../Actions/api.actions';
import { toggleLoader, clearFilteredHistory } from '../../Actions/pss.actions';
import { loaderState, notifyType, notifyUser, extractDate, extractTime, loadingHints } from '../../Utils/pss.helper';

class BrowserHistory extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            hideChip: true
        }
    }

    componentDidMount() {
        this.props.toggleLoader(loaderState.ON, loadingHints[Math.floor(Math.random() * loadingHints.length)]);
        this.props.getBrowserHistory(this.props.deviceId);
    }

    componentWillReceiveProps() {
        if (this.props.browserHistory && this.state.isLoading) {
            this.setState({ isLoading: false });
            this.props.toggleLoader(loaderState.OFF);
        }
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

    rotateArrow(index) {
        if ($('#arrow' + index).hasClass('open')) {
            $('#arrow' + index).removeClass('open');
            $('#arrow' + index).addClass('close');
        }
        else {
            $('#arrow' + index).removeClass('close');
            $('#arrow' + index).addClass('open');
        }
    }

    handleDateChange(event) {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    handleDelete() {
        this.props.toggleLoader(loaderState.ON, loadingHints[Math.floor(Math.random() * loadingHints.length)]);
        this.setState({
            hideChip: true,
            fromDate: null,
            toDate: null
        });
        this.props.clearFilteredHistory();
        setTimeout(() => {
            this.props.toggleLoader(loaderState.OFF);
        }, 700)
    }

    searchByDate() {
        if (this.state.fromDate && this.state.toDate) {
            this.props.toggleLoader(loaderState.ON, loadingHints[Math.floor(Math.random() * loadingHints.length)]);
            const startDate = new Date(this.state.fromDate);
            const stopDate = new Date(this.state.toDate);
            const
                dateList = new Array(),
                date = new Date(startDate);
            while (date <= stopDate) {
                const newDate = new Date(date);
                dateList.push(newDate.getDate() + "-"
                    + (newDate.getMonth() + 1) + "-"
                    + newDate.getFullYear());
                date.setDate(date.getDate() + 1);
            }
            this.props.getBrowserHistoryByDate(this.props.deviceId, dateList)
                .then(() => {
                    this.setState({
                        hideChip: false
                    })
                })
                .catch((err) => {
                    notifyUser(err, notifyType.warning);
                    this.setState({
                        fromDate: null,
                        toDate: null
                    });
                })
                .then(() => {
                    this.props.toggleLoader(loaderState.OFF);
                })
        } else {
            notifyUser('From & To Date is Required for Search', notifyType.warning);
        }
    }

    render() {
        this.uniqueDates = [];
        if (this.props.browserHistory) {
            const dates = [];
            this.props.browserHistory.forEach((history, index) => {
                dates.push(extractDate(history.utc_time));
                if (index === this.props.browserHistory.length - 1) {
                    this.uniqueDates = [...new Set(dates)];
                }
            });
        }
        return (
            <div>
                <div className={"row " + (this.state.hideChip ? 'mb-5' : 'mb-3')}>
                    <TextField
                        id="fromDate"
                        label="From"
                        type="date"
                        inputProps={{ min: '2018-10-01', max: `${extractDate().split("-").reverse().join("-")}` }}
                        className="col-3 filter"
                        onChange={this.handleDateChange.bind(this)}
                        value={this.state.fromDate ? this.state.fromDate : ""}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        id="toDate"
                        label="To"
                        type="date"
                        inputProps={{ min: '2018-10-01', max: `${extractDate().split("-").reverse().join("-")}` }}
                        className="col-3 filter"
                        onChange={this.handleDateChange.bind(this)}
                        value={this.state.toDate ? this.state.toDate : ""}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <Button variant="contained" className="filter search-button" size="small" onClick={this.searchByDate.bind(this)}>
                        <SearchIcon style={{ fontSize: 20 }} />
                        Search
                    </Button>
                </div>
                <div className="mb-4 ml-4 hvr-grow-shadow">
                    {
                        this.state.hideChip ?
                            null :
                            <Chip color="primary"
                                icon={<img src={FilterIcon} />}
                                onDelete={this.handleDelete.bind(this)}
                                label={`${this.state.fromDate.split("-").reverse().join("-")} - ${this.state.toDate.split("-").reverse().join("-")}`}
                                hidden={this.state.hideChip} />
                    }
                </div>
                {this.uniqueDates.map((date, index) => {
                    let count = 0;
                    return (
                        <div id={date} key={index}>
                            <div className="accordion" id={'accordion' + index}>
                                <div className="card shadow mb-4">
                                    <div className="card-header text-center" id={'heading' + index}>
                                        <span className="font-weight-bold date">{date}</span>
                                        <div className="float-right cursor" onClick={this.rotateArrow.bind(this, index)} data-toggle="collapse" data-target={'#collapse' + index} aria-expanded="true" aria-controls={'#' + index} >
                                            <div id={'arrow' + index} className="arrow"><KeyboardArrowDown /></div>

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
                                                        if (extractDate(history.utc_time) === date) {
                                                            return (
                                                                <tr key={history.hash}>
                                                                    <th scope="row" className="text-center v-align">{++count}</th>
                                                                    <td className="v-align"><div className="scroll4">{history.title}</div></td>
                                                                    <td className="v-align"><div className="scroll4">{history.url}</div></td>
                                                                    <td className="v-align text-center"><div className="scroll4">{extractTime(history.utc_time)}</div></td>
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

export default connect(mapStateToProps, { getBrowserHistory, toggleLoader, getBrowserHistoryByDate, clearFilteredHistory })(BrowserHistory);