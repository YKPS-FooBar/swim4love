import os


class Config:
    '''Common configurations.'''

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///swim4love.db'
    THREADS_PER_PAGE = 2
    CSRF_ENABLED = True
    CORS_HEADERS = 'Content-Type'


class DevelopmentConfig(Config):
    '''Development configurations.'''

    ENV = 'development'
    TESTING = True
    DEBUG = True
    JSONIFY_PRETTYPRINT_REGULAR = True
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_TRACK_MODIFICATIONS = True


class ProductionConfig(Config):
    '''Production configurations.'''

    ENV = 'production'
    TESTING = False
    DEBUG = False
    JSONIFY_PRETTYPRINT_REGULAR = False
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False


if not os.path.isfile('instance/secrets.py'):
    print('No secret key file (instance/secrets.py) detected. Auto-generating...')
    os.makedirs('instance', exist_ok=True)
    with open('instance/secrets.py', 'w') as file:
        file.write('SECRET_KEY = {!r}\n'.format(os.urandom(24).hex()))


app_config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}
