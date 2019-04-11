# Setting up database

0) install python dependencies `pip install -r requirements.txt`
1) install postgres
2) Create Database on Server
 `sudo apt-get install postgresql postgresql-contrib`
 `sudo su`
 `update-rc.d postgresql enable`
 `service postgresql start`
 `su - postgres`
 `psql postgres`
 `CREATE DATABASE checkin_dev;`
3) `adduser checkin`
5) `createuser --interactive --pwprompt`
4) `sudo su - checkin`
5) Clone repo
10) Update your `config.py` file (`SQLALCHEMY_DATABASE_URI`)
11) Run `python manage.py db init`
12) Run `python manage.py db migrate`
113) Run `python manage.py db upgrade`

# Setup admin user

7) Setup your admin username password combo in `start_script.py`
8) Run `python start_script.py 0`

You're all set! Now it's time to use the online interface!
(But you can just mess around with start_script as well)

# Start server

9) Run `python runserver.py` or python3 since we require python3 to run


# Setup on Amazon EC2 instance with nginx

This server works best with Nginx with a service to run the server backend

Create file in `/lib/systemd/system/checkin.service`
Chmod the file `sudo chmod 644 /lib/systemd/system/checkin.service`
`sudo systemctl daemon-reload`
`sudo systemctl enable checkin.service`

  [Unit]
  Description=checkin
  After=network.target

  [Service]
  Type=simple
  User=checkin
  EnvironmentFile=/home/checkin/checkin/environment
  ExecStart=/usr/bin/python /home/checkin/checkin/runserver.py
  WorkingDirectory=/home/checkin/checkin
  Restart=always

  [Install]
  WantedBy=multi-user.target

Also you can change your ExecStart to match your virtualEnv

  location /api/ {
    proxy_pass http://127.0.0.1:5000/;
    proxy_set_header X-Real-IP $remote_addr;
  }
  location / {
    root /home/checkin/checkin/build;
    try_files $uri $uri/ =404;
  }
