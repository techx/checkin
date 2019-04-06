from app.controllers.authentication import Auth
from app.controllers.database import Database
from . import errorStatus
from flask_restful import Resource
from flask import request
import json

class AttendeeList(Resource):
    @Auth.getClient(errorStatus)
    def post(self, client):
        if 'params' in request.form:
            params = json.loads(request.form['params'])
            if "event_id" in params:
                event = Database.getEvent(client, params['event_id'])
                if event is None:
                    return errorStatus("event is nonexistant/not accessible by user")
                return {'status': True, 'attendees': [a.as_dict() for a in event.attendees]}
            return errorStatus("event is nonexistant")
        return errorStatus("no data")

class AttendeeAction(Resource):
    @Auth.getClient(errorStatus)
    def post(self, client):
        if 'params' in request.form:
            success = Database.parseEventAction(client, json.loads(request.form['params']))
            if success:
                return {'status': True}
            else:
                return errorStatus("could not complete action")
        return errorStatus("no data")
