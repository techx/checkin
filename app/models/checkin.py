from app import db
import datetime
from app.helpers.passwords import *

eventUsers = db.Table(
    'eventusers',
    db.Column('user_id', db.Integer, db.ForeignKey(
        'users.id'), primary_key=True),
    db.Column('event_id', db.Integer, db.ForeignKey(
        'events.id'), primary_key=True)
)

class Log(db.Model):
    __tablename__ = 'logs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    action = db.Column(db.String())
    value = db.Column(db.String())
    attendee_id = db.Column(db.Integer, db.ForeignKey("attendees.id"))
    attendee = db.relationship("Attendee")
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)

class Client(db.Model):
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = db.relationship("User")

    token = db.Column(db.String(), primary_key=True, unique=True)
    token_expired_at = db.Column(db.DateTime, default=lambda _: (datetime.datetime.now() + datetime.timedelta(days=5)))
    token_created_at = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, user, token):
        self.user = user
        self.token = token

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
    actions = db.Column(db.Text, default="")
    notes = db.Column(db.Text, default="")
    is_manual = db.Column(db.Boolean, default=False)

    type = db.Column(db.Integer, default=0) #0 for participant, 10 for mentor, 11 for sponsor

    event_id = db.Column(db.Integer, db.ForeignKey('events.id'))
    event = db.relationship("Event", back_populates="attendees")

    logs = db.relationship("Log", back_populates="attendee")

    def __init__(self, event, name, scan_value, email, school, type=0, is_manual=False):
        self.name = name
        self.scan_value = scan_value
        self.email = email
        self.school = school
        self.type = type
        self.is_manual = is_manual
        self.event = event
    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) if getattr(self, c.name) is not None else None for c in self.__table__.columns}

class User(db.Model):
    __tablename__ = 'users'


    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(), nullable=False)
    name = db.Column(db.String(40))
    is_admin = db.Column(db.Boolean(), default=False)

    events = db.relationship("Event",
                          secondary=eventUsers,lazy='dynamic')

    def __init__(self, username, password, name, is_admin):
        self.username = username
        self.password = hash_password(password)
        self.name = name
        self.is_admin = is_admin


class Event(db.Model):
    __tablename__ = 'events'

    # many-to-many relationship with User

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(140), nullable=False)
    time = db.Column(db.DateTime, nullable=False) #TODO
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    attendees = db.relationship("Attendee", back_populates='event')
