from app import db
import datetime
from app.helpers.passwords import *

class Attendee(db.Model):
    __tablename__ = 'attendees'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    checkin_status = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    scan_value = db.Column(db.String(40), nullable=True)
    scan_value_others = db.Column(db.String(120), nullable=True)
    name = db.Column(db.String(40))
    email = db.Column(db.String(60))
    school = db.Column(db.String(60))
    actions = db.Column(db.Text, default=";")
    notes = db.Column(db.Text, default="")
    is_manual = db.Column(db.Boolean, default=False)

    type = db.Column(db.Integer, default=0) #0 for participant, 10 for mentor, 11 for sponsor

    event_id = db.Column(db.Integer, db.ForeignKey('events.id'))
    event = db.relationship("Event", back_populates="attendees")

    logs = db.relationship("Log", back_populates="attendee")

    def __init__(self, event, name, scan_value, email, school, type=0, is_manual=False, actions=";", checkin_status=0):
        self.name = name
        self.scan_value = scan_value
        self.email = email
        self.school = school
        self.type = type
        self.is_manual = is_manual
        self.event = event
        self.actions = actions
        self.checkin_status = checkin_status

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) if getattr(self, c.name) is not None else None for c in self.__table__.columns}
