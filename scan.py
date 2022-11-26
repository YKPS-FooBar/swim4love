"""For the device with direct output feed to the screen.

Handles leaderboard display and achievement page upon barcode scan.
"""

import time
import sys

from selenium import webdriver

from swim4love.site_config import ROOT_URL
from swim4love.helper import is_valid_id


root_url = ROOT_URL if len(sys.argv) <= 1 else sys.argv[1]

with webdriver.Chrome() as driver:
    driver.get(root_url + '/leaderboard')
    print("请先登记ID再输入需要显示游泳者ID")
    while True:
        swimmer_id = input('Swimmer ID: ')
        if not is_valid_id(swimmer_id):
            print('Invalid swimmer ID')
            continue
        driver.get(root_url + '/achievement/' + swimmer_id)
        # a thing i learned from last year:
        # the swimmer is likely to take a photo with the achievement page
        # so the timeout should be loooong
        # Edit: Extended the timout from 16 to 20
        try:
            time.sleep(20)
        except KeyboardInterrupt:
            break
        driver.get(root_url + '/leaderboard')
