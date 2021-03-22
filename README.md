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
FLASK_ENV=development python run.py <port>
```

## Production Run
Run
```sh
python run.py <port>
```

Eventlet is automatically used.

Don't use gunicorn multiple workers since it is [not supported by Flask-SocketIO](https://flask-socketio.readthedocs.io/en/latest/#gunicorn-web-server).

## Clean data
The code produces cache and databases storing names of swimmers, etc. To clean them, run
```sh
python clean.py
```

## Legacy
Pre-2019 code can be found at [yu-george/swim4love](https://github.com/yu-george/swim4love).

2019 code can be found at [commit 0b21f18](https://github.com/YKPS-FooBar/swim4love/tree/0b21f18).
