import React, { Component, Fragment } from "react";
import { HashRouter, Route, Switch, NavLink as RRNavLink } from "react-router-dom";
import {
  Container,
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';
import './App.css';
import Dashboard from './Dashboard';
import Database from './Database';
import { Login, Logout } from './Login';
import Settings from './Settings';
import Alert from 'react-s-alert';

import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      name: Database.client_name()
    };
  }

  updateName = (name) => {
    this.setState({
      ...this.state,
      name: name
    });
  }

  componentWillMount() {
    this.setState({
      ...this.state,
      name: Database.client_name()
    });
  }

  toggle() {
    this.setState({
      ...this.state,
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <Fragment>
        <HashRouter>
          <Navbar color="light" light expand="md">
            <Container>
              <NavbarBrand>HACK Checkin! v0.1</NavbarBrand>
              <NavbarToggler onClick={this.toggle} />
              <Collapse isOpen={this.state.isOpen} navbar>
                <Nav navbar>
                  <NavItem>
                    <NavLink tag={RRNavLink} to="/" activeClassName="active">Event</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink tag={RRNavLink} to="/settings">Settings</NavLink>
                  </NavItem>
                </Nav>

                <Nav className="ml-auto" navbar>
                  <NavItem>
                    <NavLink>
                      Hello {this.state.name}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink tag={RRNavLink} to="/logout">Logout</NavLink>
                  </NavItem>
                </Nav>
              </Collapse>
            </Container>
          </Navbar>
          <Switch>
            <Route path="/settings" component={Settings} />
            <Route path="/login" render={(props) => <Login onNameChange={this.updateName} {...props}/>} />
            <Route path="/logout" render={(props) => <Logout onNameChange={this.updateName} {...props}/>} />
            <Route path="/" component={Dashboard} />
          </Switch>
        </HashRouter>
        <Alert stack={{limit: 3}} />
      </Fragment>
    );
  }
}

export default App
