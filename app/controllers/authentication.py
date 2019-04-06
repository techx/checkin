from app import db
from app.models.checkin import *
from app.helpers.passwords import *
from enum import Enum
from functools import wraps

from flask import request
import datetime

class Auth:
    @staticmethod
    def authenticate(username, password):
        """
        Returns user model
        Raises AuthError
        """
        user = User.query.filter_by(username=username).first()
        if user is None or not verify_password(user.password, password):
            raise AuthClient(AuthStatus.LOGIN_INCORRECT)
        token = generate_token()
        while (len(Client.query.filter_by(token=token).all()) > 0):
            token = generate_token()
        client = Client(user, token)
        db.session.add(client)
        db.session.commit()
        return AuthClient(AuthStatus.SUCCESS, client)

    @staticmethod
    def authenticateWithToken(token):
        """
        Returns AuthClient
        """
        client = Client.query.filter_by(token=token).first()
        if (client is not None):
            if client.token_expired_at < datetime.datetime.now():
                return AuthClient(AuthStatus.TOKEN_EXPIRED)
        else:
            return AuthClient(AuthStatus.TOKEN_INCORRECT)
        return AuthClient(AuthStatus.SUCCESS, client)

class AuthClient(object):
    def __init__(self, authStatus, client=None):
        self.client = client
        self.authStatus = authStatus

class AuthStatus(Enum):
    SUCCESS = 1
    NAN_TOKEN = 2
    TOKEN_INCORRECT = 3
    TOKEN_EXPIRED  = 4
    LOGIN_INCORRECT = 6
