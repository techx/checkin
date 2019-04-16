import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Col, Badge, Button, FormGroup, Input, Container } from 'reactstrap';
import { InputGroup, InputGroupAddon, CustomInput, InputGroupText } from 'reactstrap';

import { UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import Database from "./Database";
import Constants from "./Constants";
import ReactTable from "react-table";
import Popup from "reactjs-popup";
import Attendee from "./models/Attendee";
import EasyAccess from "./EasyAccess";
import 'react-table/react-table.css';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';

import Alert from 'react-s-alert';
import ALERT_SETTINGS from "./Constants";

const LABEL_URL = `${process.env.PUBLIC_URL}/Label.label`;
class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      'searchValue': "",
      'page': 0,
      'printers': [],
      'printerName': Constants.DONT_PRINT_NAME,
      'tags': '',
      'checkin': "doing nothing",
      'attendees': [],
      'filteredAttendees': [],
      'applyDisabled': true,
      'view_confirmApply': false,
      'currentAttendee': new Attendee("", "", "", ""),
      'day': 1
    };
    if (Database.client_loggedIn()) {
      if (!Database.client_isEmptyEvent()) {
        fetch(LABEL_URL).then((response) => response.text()).then((result) => {
          this.printLabelXml = result;
        }).catch((e) => {
        });
        this.getAttendees();
      }
      if(Database.client_offline()) {
        Alert.error("Can't connect to server", ALERT_SETTINGS);
      }
    }
  }

  getAttendees = () => {
    Database.event_getAttendees().then((result) => {
      this.setState({ ...this.state, 'attendees': result });
      this.updateFilteredAttendees("");
      Alert.success("Attendees loaded", ALERT_SETTINGS);
    }).catch((result) => {
      console.log("could not fetch users; loading backup");
      this.setState({ 'attendees': result });
      this.updateFilteredAttendees("");
      Alert.warning("Attendees loaded from backup", ALERT_SETTINGS);
    });
  }

  componentDidMount() {
    this.printerInterval = setInterval(this.refreshPrinters, 60 * 1000);
    this.refreshPrinters();
    document.addEventListener("keydown", this._handleKeyDown);
  }

  componentWillUnmount() {
    clearInterval(this.printerInterval);
    document.removeEventListener("keydown", this._handleKeyDown);
  }

  refreshPrinters = () => {
    this.setState({
      ...this.state,
      'printers': [{ name: Constants.DONT_PRINT_NAME }].concat(window.dymo.label.framework.getPrinters())
    });
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: (event.target.type === "checkbox") ? event.target.checked : event.target.value
    }, () => {
      // Check to enable applyDisabled
      this.updateApplyDisabled();
    });
  }

  updateApplyDisabled = () => {
    if (this.state.checkin !== "doing nothing" || this.state.tags.length > 0 || this.state.printerName !== Constants.DONT_PRINT_NAME) {
      this.setState({
        'applyDisabled': false
      });
    } else {
      this.setState({
        'applyDisabled': true
      });
    }
  }

  print = (attendee) => {
    if (this.state.printerName === Constants.DONT_PRINT_NAME) {
      return;
    }
    const builder = new window.dymo.label.framework.LabelSetBuilder();
    let record = builder.addRecord();
    console.log(this.state);
    if (attendee.name) {
      record.setText('NAME', attendee.name);
    }
    if (attendee.school) {
      record.setText('SCHOOL', attendee.school);
    }
    if (attendee.checkin_status) {
      record.setText('QR', attendee.checkin_status);
    }
    window.dymo.label.framework.printLabel(this.state.printerName, null, this.printLabelXml, builder.toString());
  }
  _handleKeyDown = (event) => {
    switch (event.keyCode) {
      // Space bar
      case 32:
        if (this.searchField !== document.activeElement) {
          this.searchField.focus();
          event.preventDefault();
        }
        break;
      case 13:
        if (this.state.view_confirmApply) {
          this.applyFunctionActual();
        }
        break;
      default:
        break;
    }
  }

  onSearchChange = (e) => {
    var searchValue = e.target.value.toLowerCase();
    this.updateFilteredAttendees(searchValue);
  }

  updateFilteredAttendees = (searchValue) => {
    const attendeeFilter = (attendee) => {
      var query, queryDay;
      if (searchValue.includes("~")) {
        queryDay = searchValue.split("~")[1];
        query = searchValue.split("~")[0];
      } else {
        query = searchValue;
      }
      var shouldKeep = ((attendee.email && attendee.email.toLowerCase().includes(query)) ||
        (attendee.scan_value).includes(query) ||
        attendee.name.toLowerCase().includes(query) ||
        attendee.tags.includes(query));
      if (!searchValue.includes("~")) {
        return shouldKeep;
      } else {
        var dayMin, dayMax;
        if (queryDay.includes("-")) {
          dayMin = parseInt(queryDay.split("-")[0]);
          dayMax = parseInt(queryDay.split("-")[1]);
        } else {
          dayMin = parseInt(queryDay);
          dayMax = parseInt(queryDay);
        }
        if (isNaN(dayMin)) {
          dayMin = 1;
        }
        if (isNaN(dayMax)) {
          dayMax = 1;
        }
        var shouldShow = false;
        for (var day = dayMin; day <= dayMax; day += 1) {
          shouldShow |= ((attendee.checkin_status & Math.pow(2, day)) > 0);
        }
        return shouldKeep && shouldShow;
      }
    };
    this.setState({
      ...this.state,
      'filteredAttendees': this.state.attendees.filter((attendee) => attendeeFilter(attendee)),
      'searchValue': searchValue
    });
  }

  onSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (this.state.filteredAttendees.length === 1 && !this.state.applyDisabled) {
        this.applyFunctionConfirm(this.state.filteredAttendees[0]);
        this.searchField.blur();
      } else {
        this.searchField.blur();
      }
    }
  }
  updateApplyFunction = (state) => {
    this.setState(state, () => {
      this.updateApplyDisabled();
    });
  }
  applyFunctionConfirm = (attendee) => {
    var tags = this.state.tags.split(",");
    if (this.state.checkin === "checkin" && !attendee.updateCheckin(this.state.day, true, true)) {
      Constants.AlertWarning("User has already checked in");
    }
    if (this.state.checkin === "uncheckin" && !attendee.updateCheckin(this.state.day, false, true)) {
      Constants.AlertWarning("User has not been checked in");
    }
    if (tags.length > 0 && !attendee.updateTags(tags, true)) {
      Constants.AlertWarning("Tag already exists");
    }
    this.setState({
      'view_confirmApply': true,
      'currentAttendee': attendee
    });
  }
  popupClose = () => {
    this.setState({ 'view_confirmApply': false });
  }
  applyFunctionActual = () => {
    const attendee = this.state.currentAttendee;
    var tags = this.state.tags.split(",");
    var attendeeJSON;
    if (this.state.checkin === "checkin") {
      attendeeJSON = { id: attendee.id, key: "CHECKIN", value: this.state.day };
      attendee.updateCheckin(this.state.day, true);
      Database.event_updateAttendee(attendeeJSON);
    } else if (this.state.checkin === "uncheckin") {
      attendeeJSON = { id: attendee.id, key: "UNCHECKIN", value: this.state.day };
      attendee.updateCheckin(this.state.day, false);
      Database.event_updateAttendee(attendeeJSON);
    }
    if (tags.length > 0) {
      const sortedTags = attendee.updateTags(tags);
      tags = sortedTags[0].map(tag => {
        return { tag: tag, key: "ACTION" };
      }).concat(sortedTags[1].map(tag => { return { tag: tag, key: "UNACTION" }; }));
      for (var v = 0; v < tags.length; v += 1) {
        var tag = tags[v];
        if (tag.tag.length > 0) {
          attendeeJSON = { id: attendee.id, key: tag.key, value: tag.tag };
          Database.event_updateAttendee(attendeeJSON);
        }
      }
    }
    if (this.state.printerName !== Constants.DONT_PRINT_NAME) {
      this.print(attendee);
    }
    this.setState({
      ...this.state,
      'filteredAttendees': this.state.attendees,
      'view_confirmApply': false,
      'searchValue': '',
    }, () => {
      // Set timeout because focus can't be instaneous
      setTimeout(() => { this.searchField.focus() }, 1);
      Alert.success(attendee.name + " updated", ALERT_SETTINGS);
    });

  }


  render() {
    if (Database.client_loggedIn()) {
      if (Database.client_isEmptyEvent()) {
        Alert.error("Choose an event", ALERT_SETTINGS);
        return (<Redirect to="/settings" />)
      }
      const columns = [{ Header: 'Name', accessor: 'name' },
      { Header: 'School', accessor: 'school' },
      { Header: 'Email', accessor: 'email' },
      {
        Header: 'Status', accessor: 'checkin_status',
        Cell: row => {
          var dayCount = 1;
          var value = parseInt(row.value);
          var ret = [];
          while (Math.pow(2, dayCount) <= value) {
            if ((Math.pow(2, dayCount) & value) > 0) {
              ret.push(<span><Badge color="primary">{dayCount}</Badge> </span>)
            }
            dayCount += 1;
          }
          return ret
        }
      },
      {
        Header: 'Tags', accessor: 'tags',
        Cell: row => {
          return row.value.split(";").map((badge) => <span><Badge color="secondary">{badge}</Badge> </span>)
        },
        style:{ 'white-space': 'unset'}
      },
      {
        Header: '',
        Cell: props => <Button onClick={(e) => this.applyFunctionConfirm(props.original)}
          disabled={this.state.applyDisabled} color='danger'>
          Apply
        </Button>
      }];
      let printerOptions = this.state.printers.map((printer,index) => <option key={index} value={printer.name}>{printer.name}</option>);
      return (
        <Container>
          <br />
          <EasyAccess updateApplyFunction={this.updateApplyFunction}/>
          <Col>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <Button id="PopoverMoreOptions" type="button">
                  More Options
                </Button>
              </InputGroupAddon>
              <InputGroupAddon addonType="prepend">
                <CustomInput id="checkin_input" type="select" name="checkin" value={this.state.checkin} onChange={this.handleChange}>
                  <option key="1" value="doing nothing">No Action</option>
                  <option key="2" value="checkin">Checkin</option>
                  <option key="3" value="uncheckin">unCheckin</option>
                </CustomInput>
              </InputGroupAddon>
              <Input placeholder="Tags separated by commas (i.e. swag, !swag remove tags)"
                name="tags" value={this.state.tags} onChange={this.handleChange} />
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  Printer:
              </InputGroupText>
                <Input type="select" name="printerName" onChange={this.handleChange}>
                  {printerOptions}
                </Input>
              </InputGroupAddon>
            </InputGroup>
            <Input name="searchValue" innerRef={ref => { this.searchField = ref }}
              value={this.state.searchValue} onChange={this.onSearchChange}
              onKeyPress={this.onSearchKeyPress} placeholder="Search for anything! ~1 will check for status for day 1" />
            <br />
            We are <b>{this.state.checkin}</b> for day <b>{this.state.day}</b>  for <b>{Database.client_currentEvent().name}
            </b> with these tags: <b>[{this.state.tags}]</b> Printing to <b>{this.state.printerName}</b>
          </Col>
          <br />
          <Col>
            {/* Actual Results */}
            <h3>Results ({this.state.filteredAttendees.length})</h3>
            <ReactTable
              data={this.state.filteredAttendees}
              columns={columns}
            />
          </Col>
          <Popup open={this.state.view_confirmApply} modal onClose={this.popupClose}>
            <Container>
              <center>
                <h2>Confirm for {this.state.currentAttendee.name}</h2>
              </center>
              <br />
              <p> Checkin: {this.state.checkin} for DAY {this.state.day}</p>
              <p> Additional Tags: {this.state.tags} </p>
              <p> Print?: {this.state.printerName !== Constants.DONT_PRINT_NAME ? "Yes" : "No"} </p>
              <center>
                <p> Press Enter or Apply Function </p>
                <Button onClick={this.popupClose}>Cancel</Button>{' '}
                <Button color="primary" onClick={this.applyFunctionActual}>Apply Function</Button>
              </center>
            </Container>
          </Popup>

          <UncontrolledPopover trigger="legacy" placement="bottom" target="PopoverMoreOptions">
            <PopoverHeader>More Options</PopoverHeader>
            <PopoverBody>

              <FormGroup>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">Day:</InputGroupAddon>
                  <Input type="number" min="1" name="day" value={this.state.day} onChange={this.handleChange} />
                </InputGroup>

                <InputGroup>
                  <Button onClick={this.getAttendees}> Force Refresh </Button>
                  <Button onClick={() => {
                    Database.push_apiCall();
                    Alert.success("Force pushing queued requests", ALERT_SETTINGS);
                  }}> Force Push </Button>
                  Total actions waiting to be pushed {Database.get_apiCallLength()}
                  <Button onClick={() => { Database.clear_apiCall(); Alert.success("Cleared queued requests", ALERT_SETTINGS); }} > Force Clear </Button>
                </InputGroup>
              </FormGroup>
            </PopoverBody>
          </UncontrolledPopover>
        </Container>
      );
    } else {
      Alert.error("Need to login", ALERT_SETTINGS);
      return (<Redirect to="/login" />)
    }
  }
}

export default Dashboard;
