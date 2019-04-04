import React, { Component, Fragment } from "react";
import { Route, Redirect, Switch, NavLink as RRNavLink } from "react-router-dom";
import { Col, Button, Table, Form, FormGroup, Label, Input, Container } from 'reactstrap';
import { InputGroup, InputGroupAddon, InputGroupText, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import Database from "./Database";
import Constants from "./Constants";
import Attendee from "./models/Attendee";

const PER_PAGE = 25;

const LABEL_URL = `${process.env.PUBLIC_URL}/Label.label`;


class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      'searchValue': "",
      'page': 0,
      'printers': [],
      'tags': '',
      'checkin': false,
      'attendees': [],
      'filteredAttendees': []
    };

    fetch(LABEL_URL).then((response) => response.text()).then((result) => {
      this.printLabelXml = result;
    });
    Database.event_getAttendees().then((result) => {
      console.log(result);
      var searchResults = [];
      for (var v = 0; v < result.attendees.length; v += 1) {
        var atd = result.attendees[v];
        console.log(atd);
        var attendee = new Attendee(atd.name, atd.scan_value, atd.email, atd.school, atd.checkin_status, atd.actions);
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
      [event.target.name]: event.target.value
    });
  }
  print = () => {
    if (this.printerName == Constants.DONT_PRINT_NAME) {
      return;
    }
    const builder = new window.dymo.label.framework.LabelSetBuilder();
    let record = builder.addRecord();
    console.log(this.state);
    if (this.state.user.name) {
      record.setText('NAME', this.state.user.name);
    }
    if (this.state.user.school) {
      record.setText('SCHOOL', this.state.user.school);
    }
    if (this.state.user.checkinId) {
      record.setText('QR', this.state.user.checkinId);
    }
    if (this.printerName) {
      window.dymo.label.framework.printLabel(this.printerName, null, this.labelXml, builder.toString());
    }
  }
  _handleKeyDown = (event) => {

    switch (event.keyCode) {
      case 27:
        this.searchField.focus();
        break;
      default:
        break;
    }
  }

  onSearchChange = (e) => {
    var searchValue = e.target.value.trim().toLowerCase();
    this.updateFilteredAttendees(searchValue);
  }

  updateFilteredAttendees = (searchValue) => {
    const attendeeFilter = (attendee) => {
      return (attendee.email && attendee.email.toLowerCase().includes(searchValue)) ||
        (attendee.scan_value).includes(searchValue) ||
        attendee.name.toLowerCase().includes(searchValue);
    };
    this.setState({
      ...this.state,
      'filteredAttendees': this.state.attendees.filter((attendee) => attendeeFilter(attendee)),
      'searchValue': searchValue
    });
  }
  onSearchKeyPress = (e) => {
    if (e.key === 'Enter' && this.state.filteredAttendees.length === 1) {
      console.log("TODO ACTION");
    }
  }


  render() {
    if (Database.client_loggedIn()) {

      let searchResultsRows = null;

      if (this.state.filteredAttendees) {
        searchResultsRows = this.state.filteredAttendees.slice(this.state.page * PER_PAGE, (this.state.page + 1) * PER_PAGE).map((attendee) =>
          <tr key={attendee.id}>
            <td>{attendee.name}</td>
            <td>{attendee.email}</td>
            <td>{attendee.school}</td>
            <td>{attendee.checkin_status}</td>
            <td>{attendee.tags}</td>
            <td>
              {/* <Button onClick={(e) => this.props.onUserSelected(user)}
                      color={Math.floor((user.presenceStatuses.get('checkin') || { 'presence': 0}).presence / Math.pow(2, window.localStorage.getItem('dayNight') || 1)) % 2 == 1 ? 'danger' : ''}>
                <FontAwesomeIcon icon="user-check" />
              </Button> */}
            </td>
          </tr>
        );
      }
      let printerOptions = this.state.printers.map((printer) => <option key={printer.name} value={printer.name}>{printer.name}</option>);
      return (
        <Container>
          <br />
          <Col>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <Input addon type="checkbox" label="Checkbox for following text input" id="checkin_button" defaultChecked={this.state.checkin} name="checkin" onChange={this.handleChange} />
                </InputGroupText>
                <InputGroupText><Label style={{ margin: 0 }} for="checkin_button">Checkin</Label></InputGroupText>
              </InputGroupAddon>
              <Input placeholder="Tags separated by commas (i.e. swag)" name="tags" value={this.state.tags} onChange={this.handleChange} />
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  Printer:
              </InputGroupText>
                <Input type="select" name="printerName" onChange={this.handleChange}>
                  {printerOptions}
                </Input>
              </InputGroupAddon>
            </InputGroup>
            <Input name="searchValue" innerRef={ref => { this.searchField = ref }} onChange={this.onSearchChange} onKeyPress={this.onSearchKeyPress} />
          </Col>
          <br />
          <Col>
            {/* Actual Results */}
            <h3>Results</h3>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>School</th>
                  <th>Email</th>
                  <th>Checked In</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {searchResultsRows}
              </tbody>
            </Table>

            <Pagination>
              <PaginationItem disabled={this.state.page === 0} >
                <PaginationLink previous onClick={this.previousPage} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink next onClick={this.nextPage} />
              </PaginationItem>
            </Pagination>
          </Col>
        </Container>
      );
    } else {
      return (<Redirect to="/login" />)
    }
  }
}

export default Dashboard;
