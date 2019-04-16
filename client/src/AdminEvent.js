import React, { Component, Fragment } from "react";
import { Col, Button, Table, Form, FormGroup, Label, Input, Container } from 'reactstrap';
import { InputGroup, InputGroupAddon, InputGroupText, Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import { UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import Database from "./Database";
import Attendee from "./models/Attendee";
import Alert from 'react-s-alert';
import ALERT_SETTINGS from "./Constants";
import CSVReader from 'react-csv-reader'

const EXAMPLE_CSV = `${process.env.PUBLIC_URL}/checkinexample.csv`;

class AdminEvent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      events: [Database.client_currentEvent()],
      add_potentialUsers: [],
      event_id: Database.client_currentEvent().id
    }
  }
  componentDidMount() {
    this.getEvents();
  }
  getEvents = () => {
    Database.user_getEvents().then((result) => {
      this.setState({ 'events': result });
    }).catch((result) => {
      console.log("could not fetch users; loading backup");
      this.setState({ 'events': result });
      Alert.warning("Events loaded from backup (offline)", ALERT_SETTINGS);
    });
  }
  uploadQuillUsers = () => {
    Database.event_addAttendees(this.state.add_potentialUsers);
    alert("uploading users... do not refresh for like 20 seconds");
  }

  handleFileRead = (e) => {
    const content = this.fileReader.result.split("\n");
    var allAttendees = [];
    for (var v=0;v < content.length;v+=1) {
      if (content[v].length == 0) {
        continue;
      }
      var userJSON = JSON.parse(content[v]);
      if (userJSON["status"]["confirmed"]) {
        var userScanID = userJSON["_id"]["$oid"];
        var email = userJSON["email"];
        var school = userJSON["profile"]["school"];
        var name = userJSON["profile"]["name"];
        var tags = ";participant;";
        var attendee = new Attendee(name, userScanID, email, school, 0, tags);
        allAttendees.push(attendee);
      }
    }
    this.setState({...this.state, add_potentialUsers: allAttendees});
  };
  handleFileReadCSV = (e) => {
    const content = e;
    var allAttendees = [];
    // Ignore first line
    for (var v=1;v < content.length;v+=1) {
      if (content[v].length == 0) {
        continue;
      }
      var userScanID = content[v][0];
      var email = content[v][2];
      var school = content[v][3];
      var name = content[v][1];
      var checkin = parseInt(content[v][5]);
      var tags = "";
      if (content[v][4].length > 0) {
        tags = ";" + content[v][4].split(";").join(";") + ";";
      }
      var attendee = new Attendee(name, userScanID, email, school, checkin, tags);
      allAttendees.push(attendee);
    }
    this.setState({...this.state, add_potentialUsers: allAttendees});
  }

  handleEventChange = (event) => {
    Database.client_updateEventId(event.target.value);
    this.setState({event_id: event.target.value});
  }

  handleFileChosen = (file) => {
      this.fileReader = new FileReader();
      this.fileReader.onloadend = this.handleFileRead;
      this.fileReader.readAsText(file);
  };

  render () {
    let events = this.state.events.map((event, index) =>  <option key={event.id} value={event.id}>{event.name}</option>);

    return (
        <Container>
          <Col>
          <FormGroup>
            <InputGroup><InputGroupAddon addonType="prepend">
            <InputGroupText> Event: </InputGroupText>
          </InputGroupAddon>
            <Input type="select" name="event" onChange={this.handleEventChange} value={this.state.event_id}>
              {events}
            </Input>
              <Button onClick={this.getEvents}> Force Refresh </Button>
            </InputGroup>
          </FormGroup>
          </Col>
          Bulk Add from Quill Attendees:
          <Input type='file'
               id='file'
               className='input-file'
               accept='.json'
               onChange={e => this.handleFileChosen(e.target.files[0])}
            />

          <a href={EXAMPLE_CSV} download>Click to download example CSV</a>
          <CSVReader
            cssClass="csv-reader-input"
            label="Bulk Add from CSV:"
            onFileLoaded={this.handleFileReadCSV}
            onError={(e) => {console.log(e);}}
            inputId="file_csv"
            inputStyle={{color: 'black'}}
          />
        <p> Total number of users: {this.state.add_potentialUsers.length} </p>
        <Button onClick={this.uploadQuillUsers}>Add All Users</Button>
        </Container>
    )
  }
}

export default AdminEvent;
