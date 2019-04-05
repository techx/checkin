import React, { Component, Fragment } from "react";
import { Route, Redirect, Switch, NavLink as RRNavLink } from "react-router-dom";
import { Col, Badge, Button, Table, Form, FormGroup, Label, Input, Container } from 'reactstrap';
import { InputGroup, InputGroupAddon, InputGroupText, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import Database from "./Database";
import Constants from "./Constants";
import Attendee from "./models/Attendee";
import ReactTable from "react-table";
import Popup from "reactjs-popup";
import 'react-table/react-table.css'

const PER_PAGE = 25;

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
      'checkin': false,
      'attendees': [],
      'filteredAttendees': [],
      'applyDisabled': true,
      'view_confirmApply': false,
      'attendee': new Attendee("", "", "", ""),
      'day': 1
    };
    fetch(LABEL_URL).then((response) => response.text()).then((result) => {
      this.printLabelXml = result;
    }).catch((e) => {
    });
    Database.event_getAttendees().then((result) => {
      var searchResults = [];
      for (var v = 0; v < result.attendees.length; v += 1) {
        var atd = result.attendees[v];
        var attendee = new Attendee(atd.name, atd.scan_value, atd.email, atd.school, atd.checkin_status, atd.notes, atd.actions, atd.id);
        searchResults.push(attendee);
      }
      this.setState({ ...this.state, 'attendees': searchResults });
      this.updateFilteredAttendees("");
    }).catch((result) => {
      console.log("could not fetch users");
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

  previousPage = (e) => {
    e.preventDefault();

    this.setState({
      ...this.state,
      'page': Math.max(0, this.state.page - 1)
    });

  }

  nextPage = (e) => {
    e.preventDefault();

    this.setState({
      ...this.state,
      'page': this.state.page + 1
    });
  }
  refreshPrinters = () => {
    this.setState({
      ...this.state,
      'printers': [{ name: Constants.DONT_PRINT_NAME }].concat(window.dymo.label.framework.getPrinters())
    });
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: (event.target.type == "checkbox") ? event.target.checked : event.target.value
    }, () => {
      // Check to enable applyDisabled
      console.log(this.state);
      if (this.state.checkin || this.state.tags.length > 0 || this.state.printerName != Constants.DONT_PRINT_NAME) {
        this.setState({
          'applyDisabled': false
        });
      } else {
        this.setState({
          'applyDisabled': true
        });
      }
    });
  }
  print = (attendee) => {
    if (this.state.printerName == Constants.DONT_PRINT_NAME) {
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
    }
  }

  onSearchChange = (e) => {
    var searchValue = e.target.value.trim().toLowerCase();
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
      if (this.state.filteredAttendees.length === 1) {
        this.applyFunctionConfirm(this.state.filteredAttendees[0]);
        this.searchField.blur();
      } else {
        this.searchField.blur();
      }
    }
  }
  applyFunctionConfirm = (attendee) => {
    this.setState({
      'view_confirmApply': true,
      'attendee': attendee
    });
  }
  popupClose = () => {
    this.setState({ 'view_confirmApply': false });
  }
  applyFunctionActual = () => {
    const attendee = this.state.attendee;

    var tags = this.state.tags.split(",");
    if (this.state.checkin) {
      var attendeeJSON = { id: attendee.id, key: "CHECKIN", value: 1 };
      attendee.updateCheckin(1);
      // Database.event_updateAttendee(attendeeJSON);
    }
    if (tags.length > 0) {
      const sortedTags = attendee.updateTags(tags);
      tags = sortedTags[0].map(tag => { return {tag: tag, key: "ACTION"}; }).concat(sortedTags[1].map(tag => { return {tag: tag, key: "UNACTION" };}));
      for (var v = 0; v < tags.length; v += 1) {
        var tag = tags[v];
        console.log(tag);
        if (tag.tag.length > 0) {
          var attendeeJSON = { id: attendee.id, key: tag.key, value: tag.tag };
          console.log(attendeeJSON);
          // Database.event_updateAttendee(attendeeJSON);
        }
      }
    }
    if (this.state.printerName != Constants.DONT_PRINT_NAME) {
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
    });
  }


  render() {
    if (Database.client_loggedIn()) {
      let searchResultsRows = null;
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
        }
      },
      {
        Header: '',
        Cell: props => <Button onClick={(e) => this.applyFunctionConfirm(props.original)}
          disabled={this.state.applyDisabled} color='danger'>
          Apply
            {/*<FontAwesomeIcon icon="user-check" />*/}
        </Button> // Custom cell components!
      }];
      let printerOptions = this.state.printers.map((printer) => <option key={printer.name} value={printer.name}>{printer.name}</option>);
      return (
        <Container>
          <br />
          <Col>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <Input addon type="checkbox" label="Checkbox for following text input" id="checkin_button" checked={this.state.checkin} name="checkin" onChange={this.handleChange} />
                </InputGroupText>
                <InputGroupText><Label style={{ margin: 0 }} for="checkin_button">Checkin</Label></InputGroupText>
              </InputGroupAddon>
              <Input placeholder="Tags separated by commas (i.e. swag, !swag remove tags)" name="tags" value={this.state.tags} onChange={this.handleChange} />
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  Printer:
              </InputGroupText>
                <Input type="select" name="printerName" onChange={this.handleChange}>
                  {printerOptions}
                </Input>
              </InputGroupAddon>
            </InputGroup>
            <Input name="searchValue" innerRef={ref => { this.searchField = ref }} value={this.state.searchValue} onChange={this.onSearchChange} onKeyPress={this.onSearchKeyPress} placeholder="Search for anything! ~1 will check for status for day 1" />
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
                <h2>Confirm for {this.state.attendee.name}</h2>
              </center>
              <br />
              <p> Checkin: {this.state.checkin ? "True" : "False"} </p>
              <p> Additional Tags: {this.state.tags} </p>
              <p> Print?: {this.state.printerName != Constants.DONT_PRINT_NAME ? "Yes" : "No"} </p>
              <center>
                <p> Press Enter or Apply Function </p>
                <Button onClick={this.popupClose}>Cancel</Button>{' '}
                <Button color="primary" onClick={this.applyFunctionActual}>Apply Function</Button>
              </center>
            </Container>
          </Popup>
        </Container>
      );
    } else {
      return (<Redirect to="/login" />)
    }
  }
}

export default Dashboard;
