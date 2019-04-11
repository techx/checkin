class Attendee {
  constructor(name, scan_value, email, school, checkin_status=0, tags="", id=0, notes="") {
    this.name = name;
    this.scan_value = scan_value;
    this.email = email;
    this.school = school;
    this.notes = notes;
    this.checkin_status = checkin_status;
    this.tags = tags;
    this.id = id;
  }

  updateCheckin(day, checkin, noAction=false) {
    if (noAction) {
      return ((this.checkin_status & Math.pow(2,day)) > 0) !== checkin;
    }
    if (checkin) {
      this.checkin_status = this.checkin_status | Math.pow(2,day);
    } else {
      if ((this.checkin_status | Math.pow(2,day)) > 0) {
        this.checkin_status -= Math.pow(2,day);
      }
    }
    return this.checkin_status;
  }

  updateTags(newTags, noAction=false) {
    // Returns [ADDED TAGS, REMOVED TAGS]
    var addedTags = [];
    var removedTags = [];
    for (var v=0;v<newTags.length;v+=1) {
      var tag = newTags[v];
      if(tag.length === 0) {
        continue;
      }
      // REMOVE TAG
      if (tag[0] === "!") {
        this.tags = this.tags.replace(tag.substring(1) + ";",'');
        removedTags.push(tag.substring(1));
      } else if (!this.tags.includes(tag + ";")) {
        this.tags += tag + ";";
        addedTags.push(tag);
      } else {
        // Includes tag
        if (noAction) {
          return false;
        }
      }
    }
    if (noAction) {
      return true;
    }
    return [addedTags, removedTags];
  }
}
export default Attendee;
