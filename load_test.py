print('✅ this script tests both server load and connection.')
print('✅ for stress test, running this script from multiple nodes/threads is recommended.')
input('⚠️ warning: this will alter/delete swimmer data: (enter to continue)')

import getpass
import random
import time

import requests


root_url = 'https://swim4love.thomaszhu.cn'

username = input('Volunteer username: ')
password = getpass.getpass('Volunteer password: ')

session = requests.Session()
session.post(root_url + '/login',
             data={'username': username, 'password': password})


id_pool = [id.zfill(3)
           for id in session.get(root_url + '/swimmer/all').json()['data'].keys()]
print(f'all ids: {id_pool}')


def add_lap():
    id = random.choice(id_pool)
    id_pool.append(id)
    print(f'lap added to {id}')
    session.post(root_url + '/swimmer/add-lap', data={'id': id})


def sub_lap():
    id = random.choice(id_pool)
    print(f'lap subbed from {id}')
    session.post(root_url + '/swimmer/sub-lap', data={'id': id})


def new_swimmer():
    id = random.choice(list(set(range(1000)) - set(id_pool)))
    id = f'{id:03d}'
    name = f'penguin{id}'
    print(f'new swimmer {id}')
    session.post(root_url + '/swimmer/add', data={'id': id, 'name': name})
    id_pool.append(id)


def del_swimmer():
    id = random.choice(id_pool)
    print(f'del swimmer {id}')
    session.post(root_url + '/swimmer/delete', data={'id': id})
    id_pool.remove(id)


start = time.time()

for i in range(50):
    new_swimmer()

for i in range(50):
    add_lap()
    add_lap()
    add_lap()
    add_lap()
    add_lap()
    sub_lap()
    new_swimmer()
    add_lap()
    add_lap()
    add_lap()
    add_lap()
    sub_lap()
    del_swimmer()

for i in range(len(id_pool)):
    del_swimmer()

end = time.time()

print(f'✅ for reference, China -> US swim4love.thomaszhu.cn: ~300s')
print(f'⚠️ the test took {end - start:.2f}s')
