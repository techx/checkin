from api.v1 import client, attendee, user, event
from flask_restful import Resource, Api
from app import api

print("IMPORTED API1")


class HelloWorld(Resource):
    def get(self):
        return {'status': True}


# Routes
api.add_resource(HelloWorld, '/api/v1/')

# Sends token
api.add_resource(client.ClientLogin, '/api/v1/client/login')

# Verify that there is connection to server
api.add_resource(client.ClientStatus, '/api/v1/client/status')

##### ATTENDEE #################################################################
# Can be offline and later
# Get all attendees in one event
api.add_resource(attendee.AttendeeList, '/api/v1/attendees')
# Update an attendee (create, modify, remove)
api.add_resource(attendee.AttendeeAction, '/api/v1/attendees/push')
# api.add_resource(attendee.AttendeeBulkAction, '/api/v1/attendees/bulkpush') #TODO

##### USER #####################################################################
api.add_resource(user.UserList, '/api/v1/users')
api.add_resource(user.UserCreate, '/api/v1/users/create')
api.add_resource(user.UserDelete, '/api/v1/users/delete')
api.add_resource(user.UserEvent, '/api/v1/users/events/push')

##### EVENT ####################################################################
api.add_resource(event.EventList, '/api/v1/events')
api.add_resource(event.EventCreate, '/api/v1/events/create')
api.add_resource(event.EventDelete, '/api/v1/events/delete')
