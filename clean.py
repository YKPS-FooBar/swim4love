import os

from config import Config
from swim4love.site_config import ROOT_DIR, AVATAR_DIR, DEFAULT_AVATAR


print('make sure the server is shut down before cleaning')
for avatar_filename in os.listdir(os.path.join(ROOT_DIR, AVATAR_DIR)):
    if avatar_filename != DEFAULT_AVATAR:
        os.remove(os.path.join(ROOT_DIR, AVATAR_DIR, avatar_filename))
db_filename = Config.SQLALCHEMY_DATABASE_URI.replace('sqlite:///', '', 1)
os.remove(os.path.join(ROOT_DIR, db_filename))
