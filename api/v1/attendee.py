from app.controllers.authentication import Auth
from app.controllers.database import Database
from . import errorStatus
from flask_restful import Resource
from flask import request

class AttendeeList(Resource):
    @Auth.getClient(errorStatus)
    def get(self, client):
        if 'event_id' in request.form:
            event = Database.getEvent(client, request.form['event_id'])
            if event is None:
                return errorStatus("event is nonexistant/not accessible by user")
            return {'status': True, 'attendees': [a.as_dict() for a in event.attendees]}
        return errorStatus("event is nonexistant")

class AttendeeAction(Resource):
    @Auth.getClient(errorStatus)
    def put(self, client):
        if 'data' in request.form:
            updateCompleted = []
            updateErrors = []
            for actionDict in request.form['data']:
                success = False
                if 'updateNumber' in actionDict:
                    updateNumber = actionDict['updateNumber']
                    success = Databse.parseEventAction(client, actionDict)
                if success:
                    updateCompleted.append(updateNumber)
                else:
                    updateErrors.append(updateNumber)
            return {'status': True, 'updatedNumbers': updateCompleted, 'errors': updateErrors}
        return errorStatus("no data")
