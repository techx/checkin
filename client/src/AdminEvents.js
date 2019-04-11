import React, { Component, Fragment } from "react";
import { Col, Badge, Button, Table, Form, FormGroup, Label, Input, Container } from 'reactstrap';
import { InputGroup, InputGroupAddon, InputGroupText, Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import { CustomInput, UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import Database from "./Database";
import Event from "./models/Event";
import ReactTable from "react-table";
import Alert from 'react-s-alert';
import ALERT_SETTINGS from "./Constants";

const noEvent = new Event("Not a event", 0);

class AdminEvents extends Component {

  constructor(props) {
    super(props);
    this.state = {
      events: [],
      users: [],
      name: '',
      time: '',
      currentEvent: noEvent,
      event_action: 'delete'
    }
    this.getEvents();
  }
  getEvents = () => {
    // Remove the first result as it is a "no event"
    Database.user_getEvents().then((result) => {
      this.setState({ 'events': result.splice(1) });
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
    Database.client_createEvent(params).then(()=> {
      Alert.success("Created event " + this.state.name.trim(), ALERT_SETTINGS);
      this.getEvents();
    }).catch(() => {
      Alert.error("Couldn't create event " + this.state.name.trim(), ALERT_SETTINGS);
    });
  }

  applyFunction = () => {
    const event = this.state.currentEvent;
    var eventJSON;
    if (this.state.event_action === "delete" && window.confirm("Are you sure you want to delete the event?")) {
      eventJSON = { id: event.id,  };
      Database.client_deleteEvent(eventJSON).then(()=> {
        Alert.success("Deleted event " + this.state.name.trim(), ALERT_SETTINGS);
        this.getEvents();
      }).catch(() => {
        Alert.error("Couldn't delete event " + this.state.name.trim(), ALERT_SETTINGS);
      });
    }
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: (event.target.type === "checkbox") ? event.target.checked : event.target.value
    });
  }

  selectEvent = (event) => {
    this.setState({currentEvent: event});
  }

  render () {
    const event_columns = [{ Header: 'Name', accessor: 'name' },
      { Header: 'Id', accessor: 'id' },
      {
        Header: '',
        Cell: props => <Button onClick={(e) => this.selectEvent(props.original)}
          color='danger'>
          Select
        </Button>
      }
    ];
    return (
        <Container>

        <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverAddEvent">
          <PopoverHeader>Create Event</PopoverHeader>
          <PopoverBody>

            <FormGroup>
              <InputGroup>
                <InputGroupAddon addonType="prepend">Name:</InputGroupAddon>
                <Input name='name' value={this.state.name} onChange={this.handleChange} />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon addonType="prepend">Parsable Time:</InputGroupAddon>
                <Input name="time" value={this.state.time} onChange={this.handleChange} />
              </InputGroup>
              </FormGroup>
              <Button onClick={this.createEvent} > Create</Button>
          </PopoverBody>
          </UncontrolledPopover>

          <FormGroup>
            <InputGroup><InputGroupAddon addonType="prepend">
            <InputGroupText> Selected Event: {this.state.currentEvent.name} </InputGroupText>
            <CustomInput id="event_options" type="select" name="action" value={this.state.event_action} onChange={this.handleChange}>
              <option value="delete">Delete Event</option>
            </CustomInput>
          </InputGroupAddon>
          <Button disabled={this.state.currentEvent === noEvent} color="info" onClick={this.applyFunction}> Apply Function </Button>

              <Button id="PopoverAddEvent" type="button" color="primary">
                Create Event
              </Button>
              <Button onClick={this.getEvents}> Force Refresh </Button>
            </InputGroup>
          </FormGroup>
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
