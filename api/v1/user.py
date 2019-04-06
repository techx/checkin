from app.controllers.authentication import Auth
from app.controllers.database import Database
from flask_restful import Resource
from flask import request
from .api import APIV1, APIStatus

class UserCreate(Resource):

    @APIV1.getClient()
    def post(self, client):
        return createStatus(APIStatus.SUCCESS)
