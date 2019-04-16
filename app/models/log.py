from app import db
import datetime
from app.helpers.passwords import *

class Log(db.Model):
    __tablename__ = 'logs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    action = db.Column(db.String())
    value = db.Column(db.String())
    attendee_id = db.Column(db.Integer, db.ForeignKey("attendees.id"))
    attendee = db.relationship("Attendee")
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
