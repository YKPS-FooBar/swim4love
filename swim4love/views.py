import sys
from functools import wraps

from flask import Response, request, send_from_directory, render_template, jsonify, redirect, url_for, make_response
from flask_login import login_user, logout_user, login_required, current_user

from swim4love import app#, db, login_manager
# from homer.models import *
from swim4love.helper import *
from swim4love.site_config import *



##################### AJAX APIs #####################

@app.route('/')
def index_page():
    return 'hello!'



##################### SocketIO #####################

@socketio.on('connect')
def socketio_new_connection():
    app.logger.info('New leaderboard connection')
    try:
        emit('init', swimmers_data, json=True)
    except Exception as e:
        app.logger.error(str(e))



##################### Web Pages #####################

@app.route('/leaderboard')
def leaderboard_page():
    return 'Leaderboard'


@app.route('/volunteer')
def volunteer_page():
    return 'Volunteer'


@app.route('/achievement/<swimmer_id>')
def achievement_page():
    return swimmer_id


@app.route('/certificate/<swimmer_id>')
def certificate_page():
    return swimmer_id
