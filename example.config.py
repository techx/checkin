class Config(object):
    DEBUG = True
    DEVELOPMENT = True
    SECRET_KEY = 'YOUR SECRET KEY'
    SQLALCHEMY_DATABASE_URI = "postgresql://localhost/databasename"
    SQLALCHEMY_TRACK_MODIFICATIONS = "False"
    FLASK_ENV = "development"
    PORT = 5000

class ProductionConfig(Config):
    DEVELOPMENT = False
    DEBUG = False
    DB_HOST = 'my.production.database' # not a docker link
