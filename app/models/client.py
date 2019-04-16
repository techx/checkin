from app import db
import datetime
from app.helpers.passwords import *

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
