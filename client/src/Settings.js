import React, { Component, Fragment } from "react";
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import AdminEvent from "./AdminEvent";
import AdminEvents from "./AdminEvents";
import AdminUsers from "./AdminUsers";
import Database from "./Database";

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

      if (Database.client_isAdmin()) {
        adminTabs = (
          <>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '2' })}
            onClick={() => { this.toggle('2'); }}
          >
            All Events
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '3' })}
            onClick={() => { this.toggle('3'); }}
          >
            All Users
          </NavLink>
        </NavItem>
        </>
      );
      adminContent = (
        <>
        <TabPane tabId="2">
          <AdminEvents />
        </TabPane>
        <TabPane tabId="3">
          <AdminUsers />
        </TabPane>
        </>
      )
      }
      return (
        <div>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === '1' })}
                onClick={() => { this.toggle('1'); }}
              >
                Event Settings
              </NavLink>
            </NavItem>
            { adminTabs }
          </Nav>
          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId="1">
              <AdminEvent />
            </TabPane>
            { adminContent }
          </TabContent>
        </div>
      );
    }
}

export default Settings;
