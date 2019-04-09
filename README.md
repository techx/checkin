# checkin
hackMIT checkin

# STATUS: still in progress (in development)

This will be updated soon with instructions on how to install everything!


Requirements:
* yarn
* python 3.6+


## Steps:

1) first create a python env wrapper `python -m venv env`
2) activate env wrapper `source env/source/activate`
3) run `pip install -r requirements.txt`
4) rename `example.config.py` to `config.py` and adjust settings
5) make sure you have postgres installed!
6) cd into client
7) run `yarn install`

optional:
1) Run `python start_script.py 0` to create an admin user!

### Running
1) activate env wrapper `source env/source/activate`
2) run server `python runserver.py`
3) in another terminal window cd into `client`
4) run `yarn start`
5) open your browser to localhost:3000
