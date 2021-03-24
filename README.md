# Swim For Love

Code for Swim For Love Charity Event.

## Installation
Run
```sh
git clone https://github.com/YKPS-FooBar/swim4love.git
cd swim4love
pip install -r requirements.txt
```
in shell to download the code and install prerequisites.

## Development Run
Run
```sh
S4L_ENV=development python run.py <port>
```

## Production Run
Run
```sh
python run.py <port>
```

Eventlet is automatically used.

Don't use gunicorn multiple workers since it is [not supported by Flask-SocketIO](https://flask-socketio.readthedocs.io/en/latest/#gunicorn-web-server). If using single-worker gunicorn, enable `--worker-class eventlet`.

A `instance/secrets.py` file containing the secret key that signs user session cookies will be automatically generated if not found.

There is a default initial admin with username `admin` and password equal to the secret key of the app (in `instance/secrets.py`). When starting the program, use this to create other admins.

## Clean data
The code produces cache and databases storing names of swimmers, etc. To clean them, run
```sh
python clean.py
```

## Legacy
Pre-2019 code can be found at [yu-george/swim4love](https://github.com/yu-george/swim4love).

2019 code can be found at [commit 0b21f18](https://github.com/YKPS-FooBar/swim4love/tree/0b21f18).
