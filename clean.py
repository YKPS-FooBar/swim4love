import os

from config import Config
from swim4love.site_config import ROOT_DIR


print('make sure the server is shut down before cleaning')
db_filename = Config.SQLALCHEMY_DATABASE_URI.replace('sqlite:///', '', 1)
os.remove(os.path.join(ROOT_DIR, db_filename))
