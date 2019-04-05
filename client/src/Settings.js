import React, { Component, Fragment } from "react";
import { Col, Button, Table, Form, FormGroup, Label, Input, Container } from 'reactstrap';
import { InputGroup, InputGroupAddon, InputGroupText, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import Database from "./Database";
import Attendee from "./models/Attendee";

class Settings extends Component {

  constructor(props) {
    super(props);
    this.state = {
      events: ["Test Event"],
      add_potentialUsers: []
    }
  }
  uploadQuillUsers = () => {
    Database.event_addAttendees(this.state.add_potentialUsers);
    alert("uploading users");
  }

  handleFileRead = (e) => {
    const content = this.fileReader.result.split("\n");
    var allAttendees = [];
    for (var v=0;v<200;v+=1) {//content.length;v+=1) {
      if (content[v].length == 0) {
        continue;
      }
      var userJSON = JSON.parse(content[v]);
      if (userJSON["status"]["confirmed"]) {
        var userScanID = userJSON["_id"]["$oid"];
        var email = userJSON["email"];
        var school = userJSON["profile"]["school"];
        var name = userJSON["profile"]["name"];
        var attendee = new Attendee(name, userScanID, email, school);
        allAttendees.push(attendee);
      }
    }
    this.setState({...this.state, add_potentialUsers: allAttendees});
  };

  handleFileChosen = (file) => {
      this.fileReader = new FileReader();
      this.fileReader.onloadend = this.handleFileRead;
      this.fileReader.readAsText(file);
  };

  render () {
    let events = this.state.events.map((eventName) =>  <option key={eventName} value={eventName}>{eventName}</option>);

    return (
        <Container>
          <Col>
          <p> Event: <Input type="select" name="printerName" onChange={this.handleChange}>
            {events}
          </Input></p>
          </Col>
          Bulk Add from Quill Attendees:
          <Input type='file'
               id='file'
               className='input-file'
               accept='.json'
               onChange={e => this.handleFileChosen(e.target.files[0])}
        />
        <p> Total number of users: {this.state.add_potentialUsers.length} </p>
        <Input type='submit' onClick={this.uploadQuillUsers}>Add All Users</Input>
        </Container>
    )
  }
}

export default Settings;
