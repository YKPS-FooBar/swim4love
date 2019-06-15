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
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_TRACK_MODIFICATIONS = True


class ProductionConfig(Config):
    '''Production configurations.'''

    ENV = 'production'
    TESTING = True
    DEBUG = True
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False


app_config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}
