import sys

from swim4love import app, socketio


if __name__ == '__main__':
    port = sys.argv[1] if len(sys.argv) > 1 else 80
    socketio.run(app, host='0.0.0.0', port=port)
