import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/SearchOutlined'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import './browserhistory.css';


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

    extractDateTime(timestamp) {
        const date = new Date(timestamp);
        const currentTime = date.getHours() + ":"
            + date.getMinutes() + ":"
            + date.getSeconds();
        return currentTime;
    }

    render() {
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

                <div className="card shadow mb-3">
                    <div className="card-header text-center">
                        Date
                         </div>
                    <div className="card-body p-0">
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
                                {this.props.browserHistory.map((history, index) => {
                                    return (
                                        <tr key={history.hash}>
                                            <th scope="row">{index + 1}</th>
                                            <td>{history.title}</td>
                                            <td>{history.url}</td>
                                            <td>{this.extractDateTime(history.utc_time)}</td>
                                            <td>{history.browser}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
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