from flask import Flask
# from flask_sqlalchemy import SQLAlchemy
# from flask_caching import Cache
from flask_login import LoginManager

from config import app_config


# Initialize all instances

app = Flask(__name__, instance_relative_config=True)
app.config.from_object(app_config['development'])
# app.config.from_pyfile('secrets.py')

# db = SQLAlchemy()
# db.init_app(app)

# cache = Cache(config={'CACHE_TYPE': 'simple'})
# cache.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)


import swim4love.views
