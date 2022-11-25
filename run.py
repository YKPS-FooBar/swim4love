import argparse
import sys

import config


if __name__ == '__main__':
    # Parse config
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)

    parser.add_argument('--host',
                        help='host address to run Flask',
                        default='localhost')

    parser.add_argument('--port',
                        help='port to run Flask',
                        type=int,
                        default=80)

    parser.add_argument('--environment',
                        help='environment for Flask',
                        choices=['development', 'production'],
                        default='production')

    parser.add_argument('--database',
                        help='database URI for SQLAlchemy',
                        default='sqlite:///swim4love.db')

    parser.add_argument('--clean',
                        help='remove all data from the database',
                        action='store_true')

    args = parser.parse_args()

    if args.environment == 'development':
        config.app_config = config.DevelopmentConfig

    config.app_config.SQLALCHEMY_DATABASE_URI = args.database

    from swim4love import app, socketio
    if args.clean:
        from swim4love import db
        with app.app_context():
            db.drop_all()
        sys.exit(0)

    # Initialize app
    socketio.run(app, host=args.host, port=args.port)
