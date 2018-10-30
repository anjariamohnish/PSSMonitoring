import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { NotificationContainer } from 'react-notifications';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'font-awesome/css/font-awesome.min.css';
import 'react-notifications/lib/notifications.css';
import 'animate.css';
import 'hover.css';
import './App.css';
import Login from './Components/Login/login';
import Loader from './Components/Loader/loader';
import Dashboard from './Components/Dashboard/dashboard';

class App extends Component {


  componentDidMount() {
  }

  render() {
    return (
      <div>
        <Loader
          active={this.props.showLoader}
          spinner
          text={this.props.loaderText}>
        </Loader>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/dashboard" component={Dashboard} />

          {/* <Route component={404Component} /> */}
        </Switch>
        <NotificationContainer />
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    showLoader: state.pssReducer.showLoader,
    loaderText: state.pssReducer.loaderText
  }
}

export default withRouter(connect(mapStateToProps, null)(App));

