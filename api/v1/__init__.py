from app import api

def errorStatus(msg, y=None):
    if y is None:
        return {'status': False, 'error': msg}
    return {'status': False, 'error': msg} + y

from api.v1 import client, attendee, user
from flask_restful import Resource, Api

print("IMPORTED API1")
class HelloWorld(Resource):
    def get(self):
        return {'status': True}


# Routes
api.add_resource(HelloWorld, '/api/v1/')
api.add_resource(client.ClientLogin, '/api/v1/client/login')
api.add_resource(client.ClientStatus, '/api/v1/client/status')
api.add_resource(attendee.AttendeeList, '/api/v1/attendees') #GET to get
api.add_resource(attendee.AttendeeAction, '/api/v1/attendees/push')
api.add_resource(user.UserCreate, '/api/v1/users/create')
