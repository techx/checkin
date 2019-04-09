import React, { Component, Fragment } from "react";
import { Col, Badge, Button, Table, Form, FormGroup, Label, Input, Container } from 'reactstrap';
import { InputGroup, InputGroupAddon, InputGroupText, Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import { UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import Database from "./Database";
import Attendee from "./models/Attendee";
import ReactTable from "react-table";
import Alert from 'react-s-alert';
import ALERT_SETTINGS from "./Constants";

class AdminEvents extends Component {

  constructor(props) {
    super(props);
    this.state = {
      events: [],
      users: [],
      name: '',
      time: '',
    }
    this.getEvents();
  }
  getEvents = () => {
    // Remove the first result as it is a "no event"
    Database.user_getEvents().then((result) => {
      this.setState({ 'events': result.splice(1) });
      Alert.success("Events loaded", ALERT_SETTINGS);
    }).catch((result) => {
      console.log("could not fetch users; loading backup");
      this.setState({ 'events': result.splice(1) });
      Alert.warning("Events loaded from backup", ALERT_SETTINGS);
    });
  }


  createEvent = () => {
    // Validate
    if (this.state.name.trim().length == 0) {
      Alert.warning("Name must be not empty", ALERT_SETTINGS);
      return;
    }

    if (this.state.time.trim().length == 0) {
      Alert.warning("Time must be not empty", ALERT_SETTINGS);
      return;
    }
    var params = {'name': this.state.name.trim(), 'time': this.state.time.trim()};
    Database.client_createEvent(params).catch(() => {
      Alert.error("Couldn't create event " + this.state.name.trim(), ALERT_SETTINGS);
    });
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: (event.target.type === "checkbox") ? event.target.checked : event.target.value
    });
  }


  render () {
    let events = this.state.events.map((eventName) =>  <option key={eventName} value={eventName}>{eventName}</option>);
    const event_columns = [{ Header: 'Name', accessor: 'name' },
      { Header: 'Id', accessor: 'id' },
      {
        Header: '',
        Cell: props => <Button onClick={(e) => this.selectEvent(props.original)}
          color='danger'>
          Select
        </Button> // Custom cell components!
      }
    ];
    return (
        <Container>

          <Button id="PopoverAddEvent" type="button">
            Create Event
          </Button>
          <Button onClick={this.getEvents}> Force Refresh </Button>
        <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAddEvent">
          <PopoverHeader>More Options</PopoverHeader>
          <PopoverBody>

            <FormGroup>
              <InputGroup>
                <InputGroupAddon addonType="prepend">Name:</InputGroupAddon>
                <Input name='name' value={this.state.name} onChange={this.handleChange} />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon addonType="prepend">Time:</InputGroupAddon>
                <Input name="time" value={this.state.time} onChange={this.handleChange} />
              </InputGroup>
              </FormGroup>
              <Button onClick={this.createEvent} > Create</Button>
          </PopoverBody>
          </UncontrolledPopover>
          <Col>
            {/* Actual Results */}
            <h3>Results ({this.state.events.length})</h3>
            <ReactTable
              data={this.state.events}
              columns={event_columns}
            />
          </Col>
        </Container>
    )
  }
}

export default AdminEvents;
