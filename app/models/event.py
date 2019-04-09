from app import db
import datetime
from app.helpers.passwords import *

class Event(db.Model):
    __tablename__ = 'events'

    # many-to-many relationship with User

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(140), nullable=False)
    time = db.Column(db.DateTime, nullable=False) #TODO
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    attendees = db.relationship("Attendee", back_populates='event')

    def __init__(self, name, time):
        self.name = name
        self.time = time
    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) if getattr(self, c.name) is not None else None for c in self.__table__.columns}
