from app import db
from app.models import *
import sys

migration = int(sys.argv[1])

if migration == 0:
    # Creates Admin User
    # [username] [password] [name] [is_admin]
    admin = User('admin', 'password', 'Kevin Fang', True)
    db.session.add(admin)
elif migration == 1:
    event = Event(name="Kevin's Event", time="today")
    db.session.add(event)
    attendee = Attendee(name="Blubity Blub", scan_value="fdsa")
    attendee.event = event
    db.session.add(attendee)
elif migration == 2:
    User.query.get(1).events.append(checkin.Event.query.get(6))
db.session.commit()
