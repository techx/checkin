from app import db
import datetime
from app.helpers.passwords import *

class Attendee(db.Model):
    __tablename__ = 'attendees'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    checkin_status = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    scan_value = db.Column(db.String(60), nullable=True)
    scan_value_others = db.Column(db.Text, nullable=True)
    name = db.Column(db.String(40))
    email = db.Column(db.String(60))
    school = db.Column(db.String(100))
    # Tags are separated by `;`
    tags = db.Column(db.Text, default=";")
    notes = db.Column(db.Text, default="")

    type = db.Column(db.Integer, default=0) #0 for participant, 10 for mentor, 11 for sponsor

    event_id = db.Column(db.Integer, db.ForeignKey('events.id'))
    event = db.relationship("Event", back_populates="attendees")

    logs = db.relationship("Log", back_populates="attendee")

    def __init__(self, event, name, scan_value, email, school, tags=";", checkin_status=0, notes="", type=0, scan_value_others=";"):
        self.name = name
        self.scan_value = scan_value
        self.email = email
        self.school = school
        self.type = type
        self.event = event
        self.tags = tags
        self.checkin_status = checkin_status
        self.notes = notes
        self.scan_value_others = scan_value_others

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) if getattr(self, c.name) is not None else None for c in self.__table__.columns}
