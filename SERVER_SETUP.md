
# Setting up database

0) install python dependencies `pip install -r requirements.txt`
1) install postgres
2) Create Database on Server
 `sudo apt-get install postgresql postgresql-contrib`
 `sudo su`
 `update-rc.d postgresql enable`
 `service postgresql start`
3) `adduser checkin` <b> For ubuntu </b>
5) `sudo -u postgres createuser checkin`
6) `sudo -u postgres createdb <dbname>`
7) `sudo -u postgres psql`
`alter user checkin with encrypted password '<password>';`
`grant all privileges on database <dbname> to checkin ;`
8) Clone repo
10) Update your `config.py` file (`SQLALCHEMY_DATABASE_URI`)
11) Run `python manage.py db init`
12) Run `python manage.py db migrate`
113) Run `python manage.py db upgrade`

# Setup admin user

7) Setup your admin username password combo in `start_script.py`
8) Run `python start_script.py 0`

You're all set! Now it's time to use the online interface!
(But you can just mess around with start_script as well)

# Local Testing

9) Run `python runserver.py` or python3 since we require python3 to run
10) cd into `client` and run `yarn start`


# Setup on Amazon EC2 instance with nginx

This server works best with Nginx with a service to run the server backend
Using supervisor to control service


### Install supervisor

`sudo apt install supervisor`

`sudo mkdir /var/log/checkin`
Add to `/etc/supervisord/conf.d/checkin.conf`
```
[program:checkin]                                                                  
command = /home/checkin/env/bin/python runserver.py PRODUCTION                                  
directory = /home/checkin/checkin
autostart = true                 
autorestart = true
user = checkin
stderr_logfile=/var/log/checkin/checkin.err.log
stdout_logfile=/var/log/checkin/checkin.out.log
```

Then run `sudo supervisorctl reread`
`sudo service supervisor restart`

### For nginx
```
  location /api/ {
    proxy_pass http://127.0.0.1:5000/api/;
    proxy_set_header X-Real-IP $remote_addr;
  }
  location / {
    root /home/checkin/checkin/build;
    try_files $uri $uri/ =404;
  }
```
