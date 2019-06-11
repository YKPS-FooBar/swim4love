from pathlib import Path

from flask import request, render_template, jsonify, send_from_directory

from swim4love import app, db, socketio
from swim4love.models import *
from swim4love.helper import *
from swim4love.site_config import *



##################### AJAX APIs #####################

@app.route('/swimmer/avatar/<swimmer_id>')
def get_swimmer_avatar(swimmer_id):
    avatar_file = '{}.jpg'.format(swimmer_id)
    if Path('{}/{}/{}'.format(ROOT_DIR, AVATAR_DIR, avatar_file)).is_file():
        return send_from_directory(AVATAR_DIR, avatar_file)
    else:
        return send_from_directory(AVATAR_DIR, DEFAULT_AVATAR)


@app.route('/swimmer/info/<swimmer_id>')
def get_swimmer_info(swimmer_id):
    # Validate data
    if not (len(swimmer_id) == SWIMMER_ID_LENGTH and swimmer_id.isdigit()):
        return jsonify({'code': 1, 'msg': 'Missing or invalid parameters'})
    
    # Fetch swimmer information
    swimmer = Swimmer.query.get(int(swimmer_id))
    data = {'id': swimmer.id, 'name': swimmer.name, 'laps': swimmer.laps}
    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


@app.route('/swimmer/add', methods=['POST'])
def add_new_swimmer():
    swimmer_id = request.form.get('id')
    swimmer_name = request.form.get('name')
    swimmer_avatar = request.files.get('avatar')

    code = 0
    msg = 'Success'

    # Validate form data
    if not all((swimmer_id, swimmer_name)):
        code = 1
        msg = 'Missing parameters'
    elif not (len(swimmer_id) == SWIMMER_ID_LENGTH and swimmer_id.isdigit()):
        code = 1
        msg = 'Invalid swimmer ID'
    # swimmer_id should not be replaced with int(swimmer_id)
    # because it is used later when saving the avatar
    elif Swimmer.query.get(int(swimmer_id)):
        code = 2
        msg = 'Swimmer ID already exists'
    
    if code == 0:
        # Add swimmer into database
        swimmer = Swimmer(id=int(swimmer_id), name=swimmer_name, laps=0)
        db.session.add(swimmer)
        db.session.commit()

        # Save swimmer avatar file
        if swimmer_avatar:
            swimmer_avatar.save('{}/{}/{}.jpg'.format(ROOT_DIR, AVATAR_DIR, swimmer_id))

    return jsonify({'code': code, 'msg': msg})


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
    return render_template('leaderboard.html')


@app.route('/volunteer')
def volunteer_page():
    return 'Volunteer'


@app.route('/achievement/<swimmer_id>')
def achievement_page(swimmer_id):
    return swimmer_id


@app.route('/certificate/<swimmer_id>')
def certificate_page(swimmer_id):
    return swimmer_id
