class Attendee {
  constructor(name, scan_value, email, school, checkin_status=0, notes="", actions="", id=0) {
    this.name = name;
    this.scan_value = scan_value;
    this.email = email;
    this.school = school;
    this.notes = notes;
    this.checkin_status = checkin_status;
    this.tags = actions;
    this.id = id;
  }

  updateCheckin(day) {
    this.checkin_status = this.checkin_status | Math.pow(2,day);
    return this.checkin_status;
  }
  updateTags(newTags) {
    // Returns [ADDED TAGS, REMOVED TAGS]
    var addedTags = [];
    var removedTags = [];
    for (var v=0;v<newTags.length;v+=1) {
      var tag = newTags[v];
      // REMOVE TAG
      if (tag[0] == "!") {
        this.tags = this.tags.replace(tag.substring(1) + ";",'');
        removedTags.push(tag);
      } else if (!this.tags.includes(tag[v])) {
        this.tags += tag + ";";
        addedTags.push(tag);
      }
    }
    return [addedTags, removedTags];
  }
}
export default Attendee;
