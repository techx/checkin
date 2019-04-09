from app.controllers.authentication import Auth, AuthClient
from .api import APIV1, APIStatus, createStatus
from flask_restful import Resource
from flask import request

class ClientLogin(Resource):
    # First check for token then username + password
    @APIV1.getClient(shouldRet=False)
    def post(self, client, errorStatus=None):
        if (client is not None):
            return createStatus(APIStatus.SUCCESS)
        if 'username' in request.form and 'password' in request.form:
            username = request.form['username']
            password = request.form['password']
            authClient = Auth.authenticate(username, password)
            client = authClient.client
            if client is None:
                errorStatus = createStatus(APIStatus.ERROR_AUTH, {
                                           'authErrorCode': authclient.authStatus
                                           })

            return createStatus(APIStatus.SUCCESS, {'token': client.token, 'name': client.user.name, 'is_admin': client.user.is_admin})
        return createStatus(APIStatus.INCORRECT_DATA)
    def get(self):
        return createStatus(APIStatus.NO_POST)


class ClientStatus(Resource):
    @APIV1.getClient()
    def post(self, client):
        return createStatus(APIStatus.SUCCESS)
