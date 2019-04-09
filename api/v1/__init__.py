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

# Get all attendees in one event
api.add_resource(attendee.AttendeeList, '/api/v1/attendees')  # GET to get

# Update an attendee
api.add_resource(attendee.AttendeeAction, '/api/v1/attendees/push')
# api.add_resource(attendee.AttendeeBulkAction, '/api/v1/attendees/bulkpush') #TODO

# Create users
api.add_resource(user.UserCreate, '/api/v1/users/create')

# Create event
api.add_resource(event.EventCreate, '/api/v1/events/create')  # GET to get

# Get all events that the user has access to
api.add_resource(event.EventList, '/api/v1/events')  # GET to get

# Get all users
api.add_resource(user.UserList, '/api/v1/users')  # GET to get
