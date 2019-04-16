import React, { Component } from 'react';
import { Redirect } from "react-router-dom";
import { Col, Badge, Button, FormGroup, Input, Container } from 'reactstrap';
import { InputGroup, InputGroupAddon, CustomInput, InputGroupText } from 'reactstrap';

import { UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import Database from './Database';
import Constants from './Constants';

class EasyAccess extends Component {
  constructor(props) {
    super(props);
  }

  clickSwag = () => {
    this.props.updateApplyFunction({'tags':'swag'});
  }

  clickCheckin = () => {
    this.props.updateApplyFunction({'checkin':'checkin'});
  }

  clickReset = () => {
    this.props.updateApplyFunction({
      'printerName': Constants.DONT_PRINT_NAME,
      'tags': '',
      'checkin': "doing nothing"
    });
  }

  render() {
    return (
      <Container className="text-center">
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <Button onClick={this.clickSwag}>
              Add Swag!
            </Button>
            <Button onClick={this.clickCheckin}>
              Add Checkin!
            </Button>
          </InputGroupAddon>
          <InputGroupAddon addonType="append">
            <Button onClick={this.clickReset}>
              Reset!
            </Button>
          </InputGroupAddon>
        </InputGroup>
        <br />
      </Container>
    );
  }
}

export default EasyAccess;
