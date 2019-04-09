from app import db
from app.models import *
import sys

migration = int(sys.argv[1])

if migration == 0:
    admin = checkin.User('admin', 'password', 'Kevin Fang', True)
    db.session.add(admin)
elif migration == 1:
    event = checkin.Event(name="Kevin's Event", time="today")
    db.session.add(event)
    attendee = checkin.Attendee(name="Blubity Blub", scan_value="fdsa")
    attendee.event = event
    db.session.add(attendee)
elif migration == 2:
    checkin.User.query.get(1).events.append(checkin.Event.query.get(6))
db.session.commit()
