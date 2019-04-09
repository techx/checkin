# Setting up database

0) install python dependencies `pip install -r requirements.txt`
1) install postgres
2) Create Database on Server
 `psql postgres`
 `CREATE DATABASE checkin_dev;`
3) Update your `config.py` file (`SQLALCHEMY_DATABASE_URI`)
4) Run `python manage.py db init`
5) Run `python manage.py db migrate`
6) Run `python manage.py db upgrade`

# Setup admin user

7) Setup your admin username password combo in `start_script.py`
8) Run `python start_script.py 0`

You're all set! Now it's time to use the online interface!
(But you can just mess around with start_script as well)

# Start server

9) Run `python runserver.py`
