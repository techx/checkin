from flask import Flask
from flask_restful import Api
import os

print("Initializing Checkin Backend")

app = Flask(__name__)



if os.environ.get('DEBUG', True):
    app.debug = True
    app.config.from_object('config.Config')
else:
    print("production not implemented")
    exit()


# Database
from flask_sqlalchemy import SQLAlchemy

# Database
db = SQLAlchemy(app)
from app.models import *

api = Api(app)
# API Version
import api.v1
