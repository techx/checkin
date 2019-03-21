from app import db
from app.models.checkin import *
from app.helpers.passwords import *
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
            raise AuthError("login incorrect")
        token = generate_token()
        while (len(Client.query.filter_by(token=token).all()) > 0):
            token = generate_token()
        client = Client(user, token)
        db.session.add(client)
        db.session.commit()
        return client

    @staticmethod
    def authenticateWithToken(token):
        """
        Returns None
        Raises AuthError
        """
        client = Client.query.filter_by(token=token).first()
        if (client is not None):
            if client.token_expired_at < datetime.datetime.now():
                raise AuthError("token expired")
        else:
            raise AuthError("token incorrect")
        return client

    @staticmethod
    def getClient(errorResponse):
        """
        Augments API by adding a client parameter to the API Resource
        """
        def wrapper(f):
            @wraps(f)
            def decorated(*args, **kwargs):
                try:
                    if 'token' in request.form:
                        token = request.form['token']
                        client = Auth.authenticateWithToken(token)
                    else:
                        raise AuthError("token not found")
                except AuthError as e:
                    return errorResponse(e.msg)
                return f(*args, client, **kwargs)
            return decorated
        return wrapper

class AuthError(Exception):
    def __init__(self, msg):
        self.msg = msg
