import React, { Component, Fragment } from "react";
import { Route, Redirect, Switch, NavLink as RRNavLink } from "react-router-dom";
import {
  Container,
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink } from 'reactstrap';

class Header extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render () {
    return (
      <Fragment>
      <Navbar color="light" light expand="md">
      <Container>
    <NavbarBrand>HACK Checkin!</NavbarBrand>
    <NavbarToggler onClick={this.toggle} />
    <Collapse navbar>
      <Nav navbar>
        <NavItem>
          <NavLink tag={RRNavLink} to="/badge" activeClassName="active">Badge</NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={RRNavLink} to="/walk-on">Walk-On</NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={RRNavLink} to="/swag">Swag</NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={RRNavLink} to="/day-select">Settings</NavLink>
        </NavItem>
      </Nav>

      <Nav className="ml-auto" navbar>
      <NavItem>
        <NavLink>
          Hello KEVIN
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink>Logout</NavLink>
      </NavItem>
    </Nav>
    </Collapse>
    </Container>
  </Navbar>
  </Fragment>
);
  }
}

export default Header;
