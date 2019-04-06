from app.controllers.authentication import Auth, AuthClient, AuthStatus
from enum import Enum
from flask import request
from functools import wraps

class APIStatus(Enum):
    SUCCESS = 1
    ERROR_AUTH = 2
    ERROR_ACTION = 3

    NO_POST = 9
    NO_DATA = 10
    INCORRECT_DATA = 11
    NO_EVENT_ID = 12
    NAN_EVENT = 20

    def __repr__(self):
        """
        Pretty text APIStatus
        """
        return "APIStatus." + self.mname

def createStatus(status, otherKeys={}):
    # print(status)
    if (status is APIStatus.SUCCESS):
        return {**{'status': True}, **otherKeys}
    else:
        return {**{
            'status': False,
            'errorCode': status.value,
            'errorCodeP': status.name
        }, **otherKeys}

class APIV1(object):
    @staticmethod
    def getClient(shouldRet=False):
        """
        API Get Client from AuthClient
        """
        def wrapper(f):
            @wraps(f)
            def decorated(*args, **kwargs):
                errorStatus = None
                if 'token' in request.form:
                    token = request.form['token']
                    authclient = Auth.authenticateWithToken(token)
                else:
                    authclient = AuthClient(AuthStatus.NAN_TOKEN)

                client = authclient.client
                if client is None:
                    errorStatus = createStatus(APIStatus.ERROR_AUTH, {
                                               'authErrorCode': authclient.authStatus
                                               })
                    if shouldRet:
                        return errorStatus
                    else:
                        return f(*args, client, **kwargs, errorStatus=errorStatus)
                return f(*args, client, **kwargs)
            return decorated
        return wrapper
