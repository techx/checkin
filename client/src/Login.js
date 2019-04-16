import React, { Component } from 'react';
import { Redirect } from "react-router-dom";
import { Col, Button, Form, FormGroup, Label, Input, Container } from 'reactstrap';
import Database from './Database';
import Constants from './Constants';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'username': "",
      'password': ""
    }
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  validateForm() {
    return this.state.password.length > 0 && this.state.username.length > 0;
  }

  onSubmit = (event) => {
    event.preventDefault();
    Database.client_login(this.state.username, this.state.password).then((data) => {
      console.log("Logged in");
      this.props.onNameChange(data.name);
      Constants.AlertSuccess("Login Success!");
    }).catch((e) => {
      console.log("Loggin failed");
      Constants.AlertError("Login Failed");
    });
  }

  render() {
    if (Database.client_loggedIn()) {
      return (<Redirect to='/' />);
    } else {
      return (
        <Container className="text-center">
          <h1>Checkin!</h1>
          <p> Brought to you by HACKMIT</p>

          <Col sm={{ size: 4, offset: 4 }}>
            <Form onSubmit={this.onSubmit}>

              <FormGroup>
                <Label for="username">Username</Label>
                  <Input type="text" name="username" id="username" placeholder="user" className="input-small" onChange={this.handleChange} value={this.state.eventName} />
              </FormGroup>
              <FormGroup>
                <Label for="password">Password</Label>
                  <Input type="password" name="password" id="password" placeholder="kevin" className="input-small" onChange={this.handleChange} value={this.state.password} />
              </FormGroup>
              <Button color="primary" disabled={!this.validateForm()} type="submit">Login</Button>
            </Form>
          </Col>
        </Container>
      );
    }
  }
}

class Logout extends Component {

  componentWillMount() {
    Database.client_logout();
    this.props.onNameChange('');
  }

  render() {
    return <Redirect to="/login" />;
  }
}

export {Login, Logout};
