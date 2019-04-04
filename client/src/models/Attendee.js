function Attendee(name, scan_value, email, school, checkin_status=0, actions="") {
  this.name = name;
  this.scan_value = scan_value;
  this.email = email;
  this.school = school;
  this.actions = actions;
  this.checkin_status = checkin_status;
}
export default Attendee;
