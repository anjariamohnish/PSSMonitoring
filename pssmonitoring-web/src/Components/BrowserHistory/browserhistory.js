import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/SearchOutlined'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import './browserhistory.css';


import { getBrowserHistory } from '../../Actions/api.actions';


class BrowserHistory extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.getBrowserHistory(this.props.deviceId);
    }

    render() {
        return (
            <div>
                <div className="mb-2 row">
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
                        <SearchIcon style={{fontSize:20}}/>
                        Search
      </Button>
                </div>

                <div className="card text-center shadow mb-3">
                    <div className="card-header">
                        Date
                         </div>
                    <div className="card-body p-0">
                        <table className="table table-bordered mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Website</th>
                                    <th scope="col">Link</th>
                                    <th scope="col">Time</th>
                                    <th scope="col">Browser</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">1</th>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>@mdo</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(null, { getBrowserHistory })(BrowserHistory);