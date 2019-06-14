from pathlib import Path

from flask import request, render_template, jsonify, send_from_directory, redirect, url_for
from flask_socketio import emit

from swim4love import app, db, socketio
from swim4love.models import Swimmer
from swim4love.helper import is_valid_id, get_error_json
from swim4love.site_config import *



##################### AJAX APIs #####################

@app.route('/swimmer/avatar/<swimmer_id>')
def get_swimmer_avatar(swimmer_id):
    # Validation
    if not is_valid_id(swimmer_id):
        return get_error_json(1)
    swimmer = Swimmer.query.get(int(swimmer_id))
    if not swimmer:
        return get_error_json(3)

    avatar_file = '{}.jpg'.format(swimmer_id)
    if Path('{}/{}/{}'.format(ROOT_DIR, AVATAR_DIR, avatar_file)).is_file():
        return send_from_directory(AVATAR_DIR, avatar_file)
    return send_from_directory(AVATAR_DIR, DEFAULT_AVATAR)


@app.route('/swimmer/info/<swimmer_id>')
def get_swimmer_info(swimmer_id):
    # Validation
    if not is_valid_id(swimmer_id):
        return get_error_json(1)
    swimmer = Swimmer.query.get(int(swimmer_id))
    if not swimmer:
        return get_error_json(3)

    # Fetch swimmer information
    data = {'id': swimmer.id, 'name': swimmer.name, 'laps': swimmer.laps}

    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


@app.route('/swimmer/add-lap', methods=['POST'])
def swimmer_add_lap():
    swimmer_id = request.form.get('id')

    # Validate
    if not is_valid_id(swimmer_id):
        return get_error_json(1)
    swimmer = Swimmer.query.get(int(swimmer_id))
    if not swimmer:
        return get_error_json(3)

    # Increment swimmer lap count
    swimmer.laps += 1
    db.session.commit()

    broadcast_swimmers()

    return jsonify({'code': 0, 'msg': 'Success'})


@app.route('/swimmer/sub-lap', methods=['POST'])
def swimmer_sub_lap():
    swimmer_id = request.form.get('id')

    # Validate form data
    if not is_valid_id(swimmer_id):
        return get_error_json(1)
    swimmer = Swimmer.query.get(int(swimmer_id))
    if not swimmer:
        return get_error_json(3)

    # Decrement swimmer lap count
    swimmer.laps -= 1
    db.session.commit()

    broadcast_swimmers()

    return jsonify({'code': 0, 'msg': 'Success'})


@app.route('/swimmer/add', methods=['POST'])
def add_new_swimmer():
    swimmer_id = request.form.get('id')
    swimmer_name = request.form.get('name')
    swimmer_avatar = request.files.get('avatar')

    # Validate
    if not swimmer_id or not swimmer_name:
        return jsonify({'code': 1, 'msg': 'Missing parameters'})
    if not is_valid_id(swimmer_id):
        return get_error_json(1)
    # swimmer_id should not be replaced with int(swimmer_id)
    # because it is used later when saving the avatar
    if Swimmer.query.get(int(swimmer_id)):
        return get_error_json(2)

    # Add swimmer into database
    swimmer = Swimmer(id=int(swimmer_id), name=swimmer_name, laps=0)
    db.session.add(swimmer)
    db.session.commit()

    # Save swimmer avatar file
    if swimmer_avatar:
        swimmer_avatar.save('{}/{}/{}.jpg'.format(ROOT_DIR, AVATAR_DIR, swimmer_id))

    broadcast_swimmers()

    return jsonify({'code': 0, 'msg': 'Success'})


# Just to take care of the accidental child.
@app.route('/swimmer/delete', methods=['POST'])
def delete_swimmer():
    swimmer_id = request.form.get('id')

    # Validate form data
    if not is_valid_id(swimmer_id):
        return get_error_json(1)
    swimmer = Swimmer.query.get(int(swimmer_id))
    if not swimmer:
        return get_error_json(3)

    # rm -rf it
    Swimmer.query.filter_by(id=int(swimmer_id)).delete()
    db.session.commit()

    broadcast_swimmers()

    return jsonify({'code': 0, 'msg': 'Success'})


##################### SocketIO #####################

def get_swimmers_data():
    return {swimmer.id: {'id': swimmer.id,
                         'name': swimmer.name,
                         'laps': swimmer.laps}
            for swimmer in Swimmer.query.all()}


def broadcast_swimmers():
    socketio.emit('swimmers', get_swimmers_data(), json=True)


@socketio.on('connect')
def socketio_new_connection():
    # By design pattern, this should be at debug level.
    app.logger.info('New leaderboard connection')
    try:
        emit('init', get_swimmers_data(), json=True)
    except Exception as e:
        app.logger.error(str(e))


##################### Web Pages #####################

@app.route('/')
def home():
    return redirect(url_for('volunteer_page'))


@app.route('/leaderboard')
def leaderboard_page():
    return render_template('leaderboard.html')


@app.route('/volunteer')
def volunteer_page():
    return render_template('volunteer.html')


@app.route('/achievement/<swimmer_id>')
def achievement_page(swimmer_id):
    # Validation
    if not is_valid_id(swimmer_id):
        return get_error_json(1)
    swimmer = Swimmer.query.get(int(swimmer_id))
    if not swimmer:
        return get_error_json(3)

    return render_template('achievement.html', id=swimmer_id)


@app.route('/certificate/<swimmer_id>')
def certificate_page(swimmer_id):
    # Validation
    if not is_valid_id(swimmer_id):
        return get_error_json(1)
    swimmer = Swimmer.query.get(int(swimmer_id))
    if not swimmer:
        return get_error_json(3)

    swimmer = Swimmer.query.get(int(swimmer_id))
    return render_template('certificate.html',
                           id=swimmer_id,
                           name=swimmer.name,
                           distance=swimmer.laps * LAP_LENGTH)


@app.route('/print-certificate/<swimmer_id>')
def print_certificate_page(swimmer_id):
    # Validation
    if not is_valid_id(swimmer_id):
        return get_error_json(1)
    swimmer = Swimmer.query.get(int(swimmer_id))
    if not swimmer:
        return get_error_json(3)

    swimmer = Swimmer.query.get(int(swimmer_id))
    return render_template('print_certificate.html',
                           name=swimmer.name,
                           distance=swimmer.laps * LAP_LENGTH)
