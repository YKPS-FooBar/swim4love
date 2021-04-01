# import os
# from time import sleep
import webbrowser

from swim4love.site_config import ROOT_URL

while True:
    id = input("swimmer_id: ")
    url = '{}/certificate/{}'.format(ROOT_URL, id)

    webbrowser.open(url)
#
# os.system('''
# osascript -e '
# tell application "Google Chrome"
#     if it is running then quit
#     activate
#     open location "{}/print-certificate/{}"
# end tell'
# '''.format(ROOT_URL, id))
# # Press command p
# os.system('osascript -e \'tell application "System Events" to keystroke "p" using {option down, command down}\'')
# sleep(3)
# # Press enter
# os.system('osascript -e \'tell application "System Events" to key code 36\'')
# sleep(0.5)
# # Focus back to terminal
# os.system('osascript -e \'tell application "Terminal" to activate\'')
