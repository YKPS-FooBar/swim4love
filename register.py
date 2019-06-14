import io
import os
# from time import sleep
from pathlib import Path

import requests
from PIL import Image

from swim4love.helper import is_valid_id


raise NotImplementedError('please change the URL to *the* URL')
SWIMMER_ADD_URL = 'http://localhost:5000/swimmer/add'
raise NotImplementedError('please change path to local avatar')
LOCAL_AVATAR_DIR = Path('.')


def get_last_avatar_bytes_and_fileno():
    filenos = [int(file.replace('.JPG', ''))
               for file in os.listdir(LOCAL_AVATAR_DIR)
               if file.endswith('.JPG') and os.path.isfile(file)]
    if not filenos:
        return b'', -1
    last_avatar = LOCAL_AVATAR_DIR / '{}.JPG'.format(max(filenos))
    avatar_path = last_avatar.as_posix()

    # Make photo a square photo of size (1000, 1000)
    im = Image.open(avatar_path)
    w, h = im.size
    if w > h:
        k = (w - h) // 2
        im.crop((k, 0, h + k, h))
    else:
        k = (h - w) // 2
        im.crop((0, k, w, w + k))
    im.thumbnail((1000, 1000))

    output = io.BytesIO()
    im.save(output, format='JPEG')
    return output.getvalue(), max(filenos)


last_avatar_fileno = -1
while True:
    swimmer_id = input('\nSwimmer ID: ')
    if not is_valid_id(swimmer_id):
        print('Invalid ID')
        continue

    # New swimmer
    name = input('Name: ')
    avatar_bytes, avatar_fileno = get_last_avatar_bytes_and_fileno()

    input('Press enter after photo is taken: ')
    is_new_avatar = avatar_fileno != last_avatar_fileno
    if is_new_avatar:
        print('Found NEW avatar')
        response = requests.post(SWIMMER_ADD_URL,
                                 data={'id': swimmer_id, 'name': name},
                                 files={'avatar': avatar_bytes})
    else:
        print('Using DEFAULT avatar')
        response = requests.post(SWIMMER_ADD_URL,
                                 data={'id': swimmer_id, 'name': name})

    if response.json()['code'] == 0:
        print('Successfully added swimmer {}'.format(swimmer_id))
        last_avatar_fileno = avatar_fileno
    else:
        print('[ERROR] {}'.format(response.json()['msg']))
