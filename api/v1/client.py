from app.controllers.authentication import Auth, AuthError
from . import errorStatus
from flask_restful import Resource
from flask import request

class ClientLogin(Resource):
    # First check for token then username + password
    def post(self):
        try:
            if 'token' in request.form:
                token = request.form['token']
                Auth.authenticateWithToken(token)
                return {'status': True, 'token': token}
            if 'username' in request.form and 'password' in request.form:
                username = request.form['username']
                password = request.form['password']
                client = Auth.authenticate(username, password)
                return {'status': True, 'token': client.token, 'name': client.user.name }
        except AuthError as e:
            return {'status': False, 'error': e.msg}
        return {'status': False, 'error': "Incorrect Keys"}
    def get(self):
        return {'status': False, 'error': "Please use POST"}

class ClientStatus(Resource):
    @Auth.getClient(errorStatus)
    def post(self, client):
        return {'status': True}
