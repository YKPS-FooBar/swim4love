import os

from config import Config


print('make sure the server is shut down before cleaning')
db_filename = Config.SQLALCHEMY_DATABASE_URI.replace('sqlite:///', '', 1)
os.remove(os.path.join('swim4love', db_filename))
