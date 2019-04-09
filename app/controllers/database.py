from app import db
from app.models.checkin import *

class Database:

    @staticmethod
    def getUsers(client):
        if Database.hasAdminPrivilege(client):
            # Admin root bits!
            return User.query.all()
        return None

    @staticmethod
    def getEvents(client):
        events = client.user.events
        if Database.hasAdminPrivilege(client):
            # Admin root bits!
            events = Event.query.all()
        return events
    @staticmethod
    def getEvent(client, event_id):
        """
        Returns None if user has no privileges
        """
        event = client.user.events.filter_by(id=event_id).first()
        if Database.hasAdminPrivilege(client):
            # Admin root bits!
            event = Event.query.get(event_id)
        return event

    @staticmethod
    def getAttendee(client, event_id, attendee_id):
        attendee = Attendee.query.get(attendee_id)
        event = Database.getEvent(client, event_id)
        if event is not None:
            return attendee
        return None

    @staticmethod
    def hasAdminPrivilege(client):
        return client.user.is_admin

    @staticmethod
    def createUser(client, params):
        if any(val not in params for val in ['name', 'username', 'password', 'is_admin']):
            return False
        if (Database.hasAdminPrivilege(client)):
            print(params)
            user = User(
                params['username'], params['password'], params['name'], params['is_admin'])
            db.session.add(user)
            db.session.commit()
            return True
        return False

    @staticmethod
    def createEvent(client, params):
        if any(val not in params for val in ['name', 'time']):
            return False
        if (Database.hasAdminPrivilege(client)):
            event = Event(name=params['name'], time=params['time'])
            client.user.events.append(event)
            db.session.add(event)
            db.session.commit()
            return True
        return False

    @staticmethod
    def parseEventAction(client, actionDict):
        if any(val not in actionDict for val in ['action', 'event_id']):
            return False
        action = actionDict['action']
        event_id = actionDict['event_id']
        if (action == "ADD"):
            if any(val not in actionDict for val in ['name']):
                return False
            event = Database.getEvent(client, event_id)
            if (event is None):
                return False
            return Database_Event.createAttendee(event, actionDict)
        elif (action == "UPDATE"):
            if any(val not in actionDict for val in ['id', 'key', 'value']):
                return False
            attendee_id = actionDict["id"]
            attendee = Database.getAttendee(client, event_id, attendee_id)
            if (attendee is None):
                return False
            return Database_Attendee.updateAttendee(
                attendee, actionDict['key'], actionDict['value'])
        return False

class Database_Event(object):
    @staticmethod
    def createAttendee(event, actionDict):
        if any(val not in actionDict for val in ['name', 'scan_value', 'email', 'school', 'tags', 'checkin_status']):
            return False
        if (Attendee.query.filter_by(scan_value=actionDict['scan_value'], event_id=event.id).first() is not None):
            print("no duplicate users allowed")
            return True
        attendee = Attendee(
            event, actionDict['name'], actionDict['scan_value'], actionDict['email'], actionDict['school'], actions=actionDict['tags'], checkin_status=actionDict['checkin_status'])
        db.session.add(attendee)
        db.session.commit()
        return True


class Database_Attendee(object):

    @staticmethod
    def updateAttendee(attendee, key, update_value):
        if key == "CHECKIN":
            attendee.checkin_status = attendee.checkin_status | int(
                pow(2, int(update_value)))
        elif key == "UNCHECKIN":
            if (attendee.checkin_status & int(pow(2, int(update_value))) > 0):
                attendee.checkin_status -= int(pow(2, int(update_value)))
        elif key == "ACTION":
            if (";" in update_value):
                return False
            if (update_value not in attendee.actions):
                attendee.actions += update_value + ";"
        elif key == "UNACTION":
            if (";" in update_value):
                return False
            if ((update_value + ";") in attendee.actions):
                attendee.actions = attendee.actions.replace(update_value + ";", "")
        else:
            return False
        db.session.commit()
        # TODO add UNCHECKIN, and UNACTION and other stuff
        return True
