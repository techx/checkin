from app import db
from app.models.checkin import *
from functools import wraps

class Database:
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
    def getAttendee(client, attendee_id):
        attendee = Attendee.query.get(attendee_id)
        event = getEvent(client, event_id)
        if event is not None:
            return attendee
        return None

    @staticmethod
    def hasAdminPrivilege(client):
        return client.user.is_admin

    @staticmethod
    def createUser(client, actionDict):
        if any(val not in actionDict for val in ['name','username', 'password']):
            return False
        if (Database.hasAdminPrivilege(client)):
            user = User(actionDict['username'], actionDict['password'], actionDict['name'], False)
            db.session.add(user)
            db.session.commit()
            return True
        return False

    @staticmethod
    def createEvent(client, actionDict):
        if any(val not in actionDict for val in ['name','time']):
            return False
        if (Database.hasAdminPrivilege(client)):
            event = Event(name=actionDict['name'], time=actionDict['time'])
            db.session.add(event)
            db.session.commit()
            return True
        return False

    @staticmethod
    def updateAttendee(attendee, key, update_value):
        if key == "CHECKIN":
            attendee.checkin_status = attendee.checkin_status | int(pow(2, int(key)))
        elif key == "ACTION":
            if (";" in update_value): return False
            if (update_value not in attendee.actions):
                attendee.actions += update_value + ";"
        else:
            return False
        db.session.commit()
        # TODO add UNCHECKIN, and UNACTION and other stuff
        return True

    @staticmethod
    def parseEventAction(client, actionDict):
        if any(val not in actionDict for val in ['action','event_id']):
            return False
        action = actionDict['action']
        event_id = actionDict['event_id']
        if (action == "ADD"):
            if any(val not in actionDict for val in ['name']):
                return False
            event = Database.getEvent(client, event_id)
            if (event is None): return False
            return Database.addAttendee(event, actionDict)
        elif (action == "UPDATE"):
            if any(val not in actionDict for val in ['id','key','value']):
                return False
            attendee = Database.getAttendee(client, attendee_id)
            if (attendee is None): return False
            event = attendee.event
            Database.updateAttendee(attendee, actionDict['key'], actionDict['value'])
        return False
