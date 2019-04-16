import React, { Component, Fragment } from "react";
import { Redirect } from "react-router-dom";
import { Container, TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import AdminEvent from "./AdminEvent";
import AdminEvents from "./AdminEvents";
import AdminUsers from "./AdminUsers";
import Database from "./Database";

import Alert from 'react-s-alert';
import ALERT_SETTINGS from "./Constants";

class Settings extends Component {

  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1'
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

    render() {
      var adminTabs;
      var adminContent;
      if (!Database.client_loggedIn()) {
        Alert.error("Need to login", ALERT_SETTINGS);
        return (<Redirect to="/login" />)
      }
      if (Database.client_isAdmin()) {
        adminTabs = (
          <>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '2' })}
            onClick={() => { this.toggle('2'); }} >
            All Events
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '3' })}
            onClick={() => { this.toggle('3'); }} >
            All Users
          </NavLink>
        </NavItem>
        </>
      );
      }
      let currentPane;
      if (this.state.activeTab == 1) {
        currentPane = <AdminEvent />
      } else if(this.state.activeTab == 2) {
        currentPane = <AdminEvents />
      } else if(this.state.activeTab == 3) {
        currentPane = <AdminUsers />
      }
      return (
        <div>

          <Container className="mt-3">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '1' })}
                  onClick={() => { this.toggle('1'); }} >
                  Event Settings
                </NavLink>
              </NavItem>
              { adminTabs }
            </Nav>
          { currentPane }
          </Container>
        </div>
      );
    }
}

export default Settings;
