import logging

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_caching import Cache
from flask_cors import CORS
from flask_login import LoginManager

from config import app_config


##################### App Initialization #####################
app = Flask(__name__, instance_relative_config=True)
app.config.from_object(app_config)
app.config.from_pyfile('secrets.py')

db = SQLAlchemy()
db.app = app  # Fix for weird "No application found" error
db.init_app(app)

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.login_message = '请登录以访问此页面'
login_manager.init_app(app)

cache = Cache(config={'CACHE_TYPE': 'simple'})
cache.init_app(app)

CORS(app)

socketio = SocketIO(app)
logging.getLogger('socketio').setLevel(logging.ERROR)


import swim4love.views
