from app.controllers.database import Database
from .api import APIV1, APIStatus, createStatus
from flask_restful import Resource
from flask import request
import json

class EventCreate(Resource):
    @APIV1.getClient()
    def post(self, client):
        if 'params' in request.form:
            params = json.loads(request.form['params'])
            if(Database.createEvent(client, params)):
                return createStatus(APIStatus.SUCCESS)
            else:
                return createStatus(APIStatus.ERROR_ACTION)
        return createStatus(APIStatus.INCORRECT_DATA)

class EventDelete(Resource):
    @APIV1.getClient()
    def post(self, client):
        if 'params' in request.form:
            params = json.loads(request.form['params'])
            if(Database.deleteEvent(client, params)):
                return createStatus(APIStatus.SUCCESS)
            else:
                return createStatus(APIStatus.ERROR_ACTION)
        return createStatus(APIStatus.INCORRECT_DATA)

class EventList(Resource):
    @APIV1.getClient()
    def post(self, client):
        events = Database.getEvents(client)
        return createStatus(APIStatus.SUCCESS, {'events': [event.as_dict() for event in events]})
