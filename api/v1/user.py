from app.controllers.database import Database
from .api import APIV1, APIStatus, createStatus
from flask_restful import Resource
from flask import request
import json

class UserCreate(Resource):
    @APIV1.getClient()
    def post(self, client):
        if 'params' in request.form:
            params = json.loads(request.form['params'])
            if(Database.createUser(client, params)):
                return createStatus(APIStatus.SUCCESS)
            else:
                return createStatus(APIStatus.ERROR_ACTION)
        return createStatus(APIStatus.INCORRECT_DATA)

class UserEvent(Resource):
    @APIV1.getClient()
    def post(self, client):
        if 'params' in request.form:
            params = json.loads(request.form['params'])
            if(Database.assignUserEvent(client, params)):
                return createStatus(APIStatus.SUCCESS)
            else:
                return createStatus(APIStatus.ERROR_ACTION)
        return createStatus(APIStatus.INCORRECT_DATA)

class UserDelete(Resource):
    @APIV1.getClient()
    def post(self, client):
        if 'params' in request.form:
            params = json.loads(request.form['params'])
            if(Database.deleteUser(client, params)):
                return createStatus(APIStatus.SUCCESS)
            else:
                return createStatus(APIStatus.ERROR_ACTION)
        return createStatus(APIStatus.INCORRECT_DATA)

class UserList(Resource):
    @APIV1.getClient()
    def post(self, client):
        users = Database.getUsers(client)
        if users is None:
            return createStatus(APIStatus.NO_ADMIN)
        return createStatus(APIStatus.SUCCESS, {'users': [user.as_dict() for user in users]})
