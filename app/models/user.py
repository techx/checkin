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

    def as_dict(self):
        return {
            'name': self.name,
            'id': self.id,
            'is_admin': self.is_admin,
            'events': [event.id for event in self.events]
        }
