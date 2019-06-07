from pathlib import Path

from flask import request, render_template, jsonify, send_from_directory

from swim4love import app, db, socketio
from swim4love.models import *
from swim4love.helper import *
from swim4love.site_config import *



##################### AJAX APIs #####################

@app.route('/avatar/<swimmer_id>')
def get_swimmer_avatar(swimmer_id):
    avatar_file = '{}.jpg'.format(swimmer_id)
    if Path('{}/{}/{}'.format(ROOT_DIR, AVATAR_DIR, avatar_file)).is_file():
        return send_from_directory(AVATAR_DIR, avatar_file)
    else:
        return send_from_directory(AVATAR_DIR, DEFAULT_AVATAR)



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
def achievement_page(swimmer_id):
    return swimmer_id


@app.route('/certificate/<swimmer_id>')
def certificate_page(swimmer_id):
    return swimmer_id
