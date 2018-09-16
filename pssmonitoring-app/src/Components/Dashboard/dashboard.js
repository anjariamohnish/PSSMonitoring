
import React, { Component } from 'react';
import { connect } from 'react-redux';
import './dashboard.css';
import NavBar from './Shared/NavBar/navbar';
import $ from 'jquery';

class Dashboard extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        return (
            <NavBar />
        );
    }
}

export default connect(null, {})(Dashboard);
