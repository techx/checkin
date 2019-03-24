import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './Header';
import Dashboard from './Dashboard';
import Settings from './Settings';
import { HashRouter, Route, Switch } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <HashRouter>
        <Header></Header>
        <Switch>
          <Route path="/settings" component={Settings} />
          <Route path="/" component={Dashboard} />
        </Switch>
      </HashRouter>
    );
  }
}


export default App;
