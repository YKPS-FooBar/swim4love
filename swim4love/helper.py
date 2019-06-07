import sys
import traceback
from functools import wraps

from flask import jsonify


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
            _, __, exc_tb = sys.exc_info()
            # Return the line number of the immediate cause, not the root cause
            return jsonify({
                           'code': -1,
                           'error': '{}: {}'.format(e.__class__.__name__, e),
                           'lineno': traceback.extract_tb(exc_tb)[1].linen
                           })
    return wrapper
