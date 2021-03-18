"""For the device with direct output feed to the screen.

Handles leaderboard display and achievement page upon barcode scan.
"""

import time

from selenium import webdriver

from swim4love.site_config import ROOT_URL
from swim4love.helper import is_valid_id


with webdriver.Chrome() as driver:
    driver.get(ROOT_URL + '/leaderboard')
    while True:
        swimmer_id = input('Swimmer ID: ')
        if not is_valid_id(swimmer_id):
            print('Invalid swimmer ID')
            continue
        driver.get(ROOT_URL + '/achievement/' + swimmer_id)
        time.sleep(8)
        driver.get(ROOT_URL + '/leaderboard')
