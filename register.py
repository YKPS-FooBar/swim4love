import io
import os
from time import sleep
from pathlib import Path
from urllib.parse import urljoin

import requests
from PIL import Image

from swim4love.helper import is_valid_id
from swim4love.site_config import ROOT_URL


swimmer_add_url = urljoin(ROOT_URL, '/swimmer/add')
# raise NotImplementedError('please change path to local avatar')
LOCAL_AVATAR_DIR = Path('avatars')


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

    input('Press enter after photo is taken: ')
    sleep(3)
    avatar_bytes, avatar_fileno = get_last_avatar_bytes_and_fileno()
    is_new_avatar = avatar_fileno != last_avatar_fileno
    if is_new_avatar:
        print('Found NEW avatar')
        response = requests.post(swimmer_add_url,
                                 data={'id': swimmer_id, 'name': name},
                                 files={'avatar': avatar_bytes})
    else:
        print('Using DEFAULT avatar')
        response = requests.post(swimmer_add_url,
                                 data={'id': swimmer_id, 'name': name})

    if response.json()['code'] == 0:
        print('Successfully added swimmer {}'.format(swimmer_id))
        last_avatar_fileno = avatar_fileno
    else:
        print('[ERROR] {}'.format(response.json()['msg']))
