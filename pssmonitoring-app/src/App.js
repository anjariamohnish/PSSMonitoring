import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { NotificationContainer } from 'react-notifications';
import Loadable from 'react-loading-overlay';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import firebase from 'firebase';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'font-awesome/css/font-awesome.min.css';
import 'react-notifications/lib/notifications.css';
import 'animate.css';
import 'hover.css';
import './App.css';


import { firebaseConfig } from './firebase-config';
import Login from './Components/Login/login';
import Dashboard from './Components/Dashboard/dashboard';

class App extends Component {


  componentDidMount() {
    firebase.initializeApp(firebaseConfig);
  }

  render() {
    return (
      <Loadable
        active={this.props.showLoader}
        spinner
        text={this.props.loaderText}>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/dashboard" component={Dashboard} />

          {/* <Route component={404Component} /> */}
        </Switch>
        <NotificationContainer />
      </Loadable>
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

