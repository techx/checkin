from app.controllers.database import Database
from flask_restful import Resource
from flask import request
import json
from .api import APIV1, APIStatus, createStatus

class AttendeeList(Resource):
    @APIV1.getClient()
    def post(self, client):
        if 'params' in request.form:
            params = json.loads(request.form['params'])
            if "event_id" in params:
                event = Database.getEvent(client, params['event_id'])
                if event is None:
                    return createStatus(APIStatus.NAN_EVENT)
                return createStatus(APIStatus.SUCCESS, {'attendees': [a.as_dict() for a in event.attendees]})
            return createStatus(APIStatus.NO_EVENT_ID)
        return createStatus(APIStatus.NO_DATA)

class AttendeeAction(Resource):
    @APIV1.getClient()
    def post(self, client):
        if 'params' in request.form:
            success = Database.parseEventAction(client, json.loads(request.form['params']))
            if success:
                return createStatus(APIStatus.SUCCESS)
            else:
                return createStatus(APIStatus.ERROR_ACTION)
        return createStatus(APIStatus.NO_DATA)

class AttendeeBulkAction(Resource):
    @APIV1.getClient()
    def post(self, client):
        #TODO
        pass
