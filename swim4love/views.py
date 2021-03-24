from pathlib import Path

from flask import request, render_template, jsonify, send_from_directory, redirect, url_for, flash, abort
from flask_socketio import emit
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

from swim4love import app, db, login_manager, socketio
from swim4love.models import Swimmer, Volunteer
from swim4love.helper import is_valid_id, get_error_json, admin_required, is_safe_url, get_swimmer, get_swimmer_data, get_swimmers_data, get_volunteer, get_volunteer_data, get_volunteers_data
from swim4love.site_config import *


##################### AJAX APIs #####################

@app.route('/swimmer/all')
def get_all_swimmers():
    data = get_swimmers_data()
    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


@app.route('/swimmer/info/<swimmer_id>')
def get_swimmer_info(swimmer_id):
    # Validation
    swimmer = get_swimmer(swimmer_id)

    data = get_swimmer_data(swimmer)
    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


@app.route('/swimmer/add-lap', methods=['POST'])
@login_required
def swimmer_add_lap():
    swimmer_id = request.form.get('id')

    # Validate
    swimmer = get_swimmer(swimmer_id)

    # Increment swimmer lap count
    swimmer.laps += 1
    db.session.commit()

    broadcast_swimmers()

    data = get_swimmer_data(swimmer)
    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


@app.route('/swimmer/sub-lap', methods=['POST'])
@login_required
def swimmer_sub_lap():
    swimmer_id = request.form.get('id')

    # Validate form data
    swimmer = get_swimmer(swimmer_id)

    if swimmer.laps == 0:
        return get_error_json(5, swimmer_id)

    # Decrement swimmer lap count
    swimmer.laps -= 1
    db.session.commit()

    broadcast_swimmers()

    data = get_swimmer_data(swimmer)
    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


@app.route('/swimmer/add', methods=['POST'])
@admin_required
def add_new_swimmer():
    swimmer_id = request.form.get('id')
    swimmer_name = request.form.get('name')

    # Validate
    if not swimmer_id or not swimmer_name:
        abort(get_error_json(4, swimmer_id))
    if not is_valid_id(swimmer_id):
        abort(get_error_json(1, swimmer_id))
    if Swimmer.query.get(int(swimmer_id)):
        abort(get_error_json(2, swimmer_id))

    # Add swimmer into database
    swimmer = Swimmer(id=int(swimmer_id), name=swimmer_name, laps=0)
    db.session.add(swimmer)
    db.session.commit()

    broadcast_swimmers()

    data = get_swimmer_data(swimmer)
    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


# Just to take care of the accidental child.
@app.route('/swimmer/delete', methods=['POST'])
@admin_required
def delete_swimmer():
    swimmer_id = request.form.get('id')

    # Validate form data
    swimmer = get_swimmer(swimmer_id)

    # rm -rf it
    Swimmer.query.filter_by(id=int(swimmer_id)).delete()
    db.session.commit()

    broadcast_swimmers()

    return jsonify({'code': 0, 'msg': 'Success'})


@app.route('/swimmer/update-name', methods=['POST'])
@admin_required
def update_swimmer_name():
    swimmer_id = request.form.get('id')
    swimmer_new_name = request.form.get('name')

    # Validate form data
    swimmer = get_swimmer(swimmer_id)
    
    swimmer.name = swimmer_new_name
    db.session.commit()

    broadcast_swimmers()

    data = get_swimmer_data(swimmer)
    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


@app.route('/volunteer/swimmers')
@login_required
def get_volunteer_swimmers():
    swimmers = current_user.swimmers

    data = {swimmer.id: get_swimmer_data(swimmer) for swimmer in swimmers}

    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


@app.route('/volunteer/link-swimmer', methods=['POST'])
@login_required
def volunteer_link_swimmer():
    swimmer_id = request.form.get('id')

    # Validate form data
    swimmer = get_swimmer(swimmer_id)

    current_user.swimmers.append(swimmer)
    db.session.commit()

    data = get_swimmer_data(swimmer)
    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


@app.route('/volunteer/unlink-swimmer', methods=['POST'])
@login_required
def volunteer_unlink_swimmer():
    swimmer_id = request.form.get('id')

    # Validate form data
    swimmer = get_swimmer(swimmer_id)

    current_user.swimmers.remove(swimmer)
    db.session.commit()

    return jsonify({'code': 0, 'msg': 'Success'})


@app.route('/volunteer/add', methods=['POST'])
@admin_required
def add_new_volunteer():
    username = request.form.get('username')
    password = request.form.get('password')
    is_admin = request.form.get('is-admin') == 'true'

    if not username or not password:
        abort(get_error_json(4, username))
    if Volunteer.query.filter_by(username=username).first():
        abort(get_error_json(7, username))

    volunteer = Volunteer(username=username,
                          password=generate_password_hash(password, method='sha256'),
                          is_admin=is_admin)
    db.session.add(volunteer)
    db.session.commit()

    data = get_volunteer_data(volunteer)
    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


@app.route('/volunteer/delete', methods=['POST'])
@admin_required
def delete_volunteer():
    username = request.form.get('username')

    # Validation
    volunteer = get_volunteer(username)

    Volunteer.query.filter_by(username=username).delete()
    db.session.commit()

    return jsonify({'code': 0, 'msg': 'Success'})


@app.route('/volunteer/all')
@admin_required
def get_all_volunteers():
    data = get_volunteers_data()
    return jsonify({'code': 0, 'msg': 'Success', 'data': data})


##################### SocketIO #####################


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
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    elif current_user.is_admin:
        return redirect(url_for('admin_page'))
    else:
        return redirect(url_for('volunteer_page'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('volunteer/login.html')

    username = request.form.get('username')
    password = request.form.get('password')

    user = Volunteer.query.filter_by(username=username).first()

    if not user:
        flash('用户名不存在')
        return render_template('volunteer/login.html')

    if not check_password_hash(user.password, password):
        flash('用户名密码错误')
        return render_template('volunteer/login.html')

    login_user(user)

    next = request.args.get('next')
    if next and is_safe_url(next):
        return redirect(next)
    else:
        return redirect(url_for('index'))


@app.route('/logout')
def logout():
    if current_user.is_authenticated:
        logout_user()
    return redirect(url_for('index'))


@app.route('/volunteer')
@login_required
def volunteer_page():
    return render_template('volunteer/volunteer.html')


@app.route('/admin')
@admin_required
def admin_page():
    return render_template('volunteer/admin.html')


@app.route('/leaderboard')
def leaderboard_page():
    return render_template('leaderboard.html')


@app.route('/achievement/<swimmer_id>')
def achievement_page(swimmer_id):
    # Validation
    swimmer = get_swimmer(swimmer_id)

    return render_template('achievement.html', id=swimmer_id)


@app.route('/certificate/<swimmer_id>')
def certificate_page(swimmer_id):
    # Validation
    swimmer = get_swimmer(swimmer_id)

    return render_template('certificate.html',
                           id=swimmer_id,
                           name=swimmer.name,
                           distance=swimmer.laps * LAP_LENGTH)


@app.route('/print-certificate/<swimmer_id>')
def print_certificate_page(swimmer_id):
    # Validation
    swimmer = get_swimmer(swimmer_id)

    return render_template('print_certificate.html',
                           name=swimmer.name,
                           distance=swimmer.laps * LAP_LENGTH)
