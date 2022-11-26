import re
import sys
import traceback
from functools import wraps
from urllib.parse import urlparse, urljoin

from flask import jsonify, request, abort, redirect, url_for, flash
from flask_login import current_user

from swim4love import login_manager
from swim4love.site_config import SWIMMER_ID_LENGTH
from swim4love.models import Swimmer, Volunteer


ERRORS = {
    1: '游泳者ID#{}格式不正确',
    2: '游泳者ID#{}已存在',
    3: '游泳者ID#{}没有登记',
    4: '请求格式不正确',
    5: '游泳者#{}的圈数不能再减啦',
    6: '志愿者 {} 不存在',
    7: '志愿者 {} 已存在',
    8: '游泳者ID#{}学院不存在',
}


def return_error_json(func):
    '''
    Catch any exception not handled and return
    the error message and line number in JSON.
    '''
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            _, _, exc_tb = sys.exc_info()
            # Return the line number of the immediate cause, not the root cause
            tb = traceback.extract_tb(exc_tb)[-1]
            error_msg = 'File "{}", line {}, in {}\n    {}\n'.format(*tb)
            error_msg += '{}: {}'.format(e.__class__.__name__, str(e))
            return jsonify({'code': -1,
                            'error': error_msg,
                            'lineno': traceback.extract_tb(exc_tb)[-1].lineno})
    return wrapper


def is_valid_id(swimmer_id):
    '''
    Checks if a given swimmer ID is valid.
    '''
    # Don't use `str.isdigit()`!  For example, try `'³'.isdigit()`.
    # Don't use `str.isnumeric()`.  It allows even more characters, like '五'.
    # Use `str.isdecimal()` in this case.
    # But, for simplicity and unambiguity, we'll use regular expressions.
    # Don't use `'\d'` for regular expressions!  It allows '੩'.
    # Use `'[0-9]'`.
    return re.fullmatch(r'[0-9]' * SWIMMER_ID_LENGTH, swimmer_id)


def get_error_json(error_code: int, swimmer_id):
    '''
    Returns the jsonified version of an error based on the error_code.
    '''
    msg = ERRORS.get(error_code, '未知错误').format(swimmer_id)
    return jsonify({'code': error_code, 'msg': msg})


def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            return login_manager.unauthorized()
        if not current_user.is_admin:
            # If some non-admin accesses admin stuff (e.g. /admin),
            # they shouldn't be redirected in a loop like
            # /admin -> /login?next=/admin -> (user logs in) -> /admin -> /login?next=/admin
            # To avoid this, I don't use the `next` param here
            flash('用户无权限访问此页面')
            return redirect(url_for('login'))
        return func(*args, **kwargs)
    return wrapper


def is_safe_url(target):
    """Test if the target redirection URL is of the same domain as the host URL"""
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc


def get_swimmer(swimmer_id):
    """Returns swimmer from the database."""
    if not is_valid_id(swimmer_id):
        abort(get_error_json(1, swimmer_id))
    swimmer = Swimmer.query.get(int(swimmer_id))
    if not swimmer:
        abort(get_error_json(3, swimmer_id))
    return swimmer


def get_swimmer_data(swimmer):
    """Fetch swimmer information"""
    return {'id': swimmer.id, 'name': swimmer.name, 'laps': swimmer.laps, 'house': swimmer.house}


def get_swimmers_data():
    """Fetch all swimmers"""
    return {swimmer.id: get_swimmer_data(swimmer)
            for swimmer in Swimmer.query.all()}


def get_volunteer(username):
    """Returns volunteer from the database."""
    volunteer = Volunteer.query.filter_by(username=username).first()
    if not volunteer:
        return get_error_json(6, username)
    return volunteer


def get_volunteer_data(volunteer):
    """Fetch volunteer information."""
    return {'username': volunteer.username, 'isAdmin': volunteer.is_admin}


def get_volunteers_data():
    """Fetch all volunteers"""
    data = {volunteer.username: get_volunteer_data(volunteer)
            for volunteer in Volunteer.query.all()}
    # This is the master account and shouldn't be messed around with
    del data['admin']
    return data
