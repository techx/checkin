import React, { Component, Fragment } from "react";
import { Col, Badge, Button, Table, Form, FormGroup, Label, Input, Container } from 'reactstrap';
import { InputGroup, InputGroupAddon, InputGroupText, CustomInput } from 'reactstrap';

import { UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import Database from "./Database";
import User from "./models/User";
import ReactTable from "react-table";
import Alert from 'react-s-alert';
import ALERT_SETTINGS from "./Constants";

const noUser = new User("Not a user");
class AdminUsers extends Component {

  constructor(props) {
    super(props);
    this.state = {
      users: [],
      name: '',
      username: '',
      password: '',
      password_confirm: '',
      is_admin: false,
      currentUser: noUser,
      user_action: 'delete'
    }
    this.getUsers();
  }
  getUsers = () => {
    // Remove the first result as it is a "no event"
    Database.client_getUsers().then((result) => {
      this.setState({ 'users': result });
      Alert.success("Users loaded", ALERT_SETTINGS);
    }).catch((result) => {
      console.log("could not fetch users; loading backup");
      this.setState({ 'users': result });
      Alert.warning("Users loaded from backup", ALERT_SETTINGS);
    });
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: (event.target.type === "checkbox") ? event.target.checked : event.target.value
    });
  }
  createUser = () => {
    // Validate
    if (this.state.name.trim().length == 0) {
      Alert.warning("Name must be not empty", ALERT_SETTINGS);
      return;
    }
    if (this.state.username.trim().length == 0) {
      Alert.warning("Username must be not empty", ALERT_SETTINGS);
      return;
    }
    if (this.state.password.trim().length == 0) {
      Alert.warning("Password must be not empty", ALERT_SETTINGS);
      return;
    }
    if (this.state.password_confirm.trim().length == 0) {
      Alert.warning("Password must be not empty", ALERT_SETTINGS);
      return;
    }
    if (this.state.password.trim() !== this.state.password_confirm.trim()) {
      Alert.warning("Passwords must match", ALERT_SETTINGS);
      return;
    }
    Alert.success("Creating user " + this.state.username.trim(), ALERT_SETTINGS);
    var params = {'name': this.state.name.trim(), 'password': this.state.password.trim(), 'username': this.state.username.trim(), 'is_admin': this.state.is_admin}
    Database.client_createUser(params).catch(() => {
      Alert.error("Couldn't create user " + this.state.username.trim(), ALERT_SETTINGS);
    });
  }

  applyFunction = () => {
    Alert.error("Can't delete through client yet");
  }

  selectUser = (user) => {
    this.setState({currentUser: user});
  }
  render () {
    const users_columns = [{ Header: 'Name', accessor: 'name' },
      { Header: 'Id', accessor: 'id' },
      { Header: 'Is Admin', accessor: 'is_admin', Cell: row => {
        if (row.original.is_admin) {
          return (<span><Badge color="primary">Admin!</Badge> </span>);
        } else {
          return ("");
        }

      } },
      { Header: 'Events', accessor: 'events' , Cell: row => {
        return row.value.map((event) => (<span><Badge color="secondary">{Database.event_idToName(event).name}</Badge> </span>))
      }},
      {
        Header: '',
        Cell: props => <Button onClick={(e) => this.selectUser(props.original)}
          color='danger'>
          Select
        </Button> // Custom cell components!
      }
    ];
    return (
        <Container>
          <Button id="PopoverAddUser" type="button">
            Add User
          </Button>
          <Button onClick={this.getUsers}> Force Refresh </Button>
        <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAddUser">
          <PopoverHeader>More Options</PopoverHeader>
          <PopoverBody>

            <FormGroup>
              <InputGroup>
                <InputGroupAddon addonType="prepend">Name:</InputGroupAddon>
                <Input name="name" value={this.state.name} onChange={this.handleChange} />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon addonType="prepend">Username:</InputGroupAddon>
                <Input name="username" value={this.state.username} onChange={this.handleChange} />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon addonType="prepend">Password:</InputGroupAddon>
                <Input type='password' name="password" value={this.state.password} onChange={this.handleChange} />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon addonType="prepend">Confirm Password:</InputGroupAddon>
                <Input type='password' name="password_confirm" value={this.state.password_confirm} onChange={this.handleChange} />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon addonType="prepend">Is Admin:</InputGroupAddon>
                <InputGroupText>
                <Input addon type='checkbox' name="is_admin" checked={this.state.is_admin} onChange={this.handleChange} />
                </InputGroupText>
              </InputGroup>
              <Button onClick={this.createUser} > Create </Button>
            </FormGroup>
          </PopoverBody>
        </UncontrolledPopover>
        <Col>
        Selected User: {this.state.currentUser.name}
        <CustomInput id="user_options" type="select" name="action" value={this.state.user_action} onChange={this.handleChange}>
          <option value="delete">Delete User</option>
        </CustomInput>
        <Button onClick={this.applyFunction}> Apply Function </Button>
        </Col>
          <Col>
            {/* Actual Results */}
            <h3>Results ({this.state.users.length})</h3>
            <ReactTable
              data={this.state.users}
              columns={users_columns}
            />
          </Col>
        </Container>
    )
  }
}

export default AdminUsers;
