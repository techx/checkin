from flask import Flask
from flask_restful import Api
import sys

print("Initializing Checkin Backend")
app = Flask(__name__)

if len(sys.argv) == 1:
    app.debug = True
    app.config.from_object('config.Config')
else:
    print("Starting production server")
    app.debug = False
    app.config.from_object('config.ProductionConfig')


# Database
from flask_sqlalchemy import SQLAlchemy

# Database
db = SQLAlchemy(app)
from app.models import *

api = Api(app)
# API Version
import api.v1
