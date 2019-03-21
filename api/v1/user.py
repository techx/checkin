from app.controllers.authentication import Auth
from app.controllers.database import Database
from . import errorStatus
from flask_restful import Resource
from flask import request

class UserCreate(Resource):

    @Auth.getClient(errorStatus)
    def put(self, client):


        return errorStatus("no admin privilege")
