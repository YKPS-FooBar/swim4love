# Swim For Love

Code for Swim For Love Charity Event.

## Installation
Run
```sh
git clone https://github.com/YKPS-FooBar/swim4love.git
cd swim4love
pip install -r requirements.txt
```
in shell to download the code and install prerequisites.

## Run
```
python run.py [-h] [--host HOST] [--port PORT] [--environment {development,production}] [--database DATABASE] [--clean]

optional arguments:
  -h, --help            show this help message and exit
  --host HOST           host address to run Flask (default: localhost)
  --port PORT           port to run Flask (default: 80)
  --environment {development,production}
                        environment for Flask (default: production)
  --database DATABASE   database URI for SQLAlchemy (default: sqlite:///swim4love.db)
  --clean               remove all data from the database (default: False)
```

Use the `--host` and `--port` flags to specify the host and port to run the server on.

The `--environment` flag specifies whether to run the code in production or development mode.

The `--database` flag is the URI to connect to for the SQL database. For example, use `--database mysql+pymysql://username:password@localhost/swim4love` for a MySQL database with a PyMySQL connector, or `--database sqlite:///swim4love.db` for a local SQLite database. Other SQL servers like PostgreSQL, Oracle, and Microsoft SQL Server are [supported](https://docs.sqlalchemy.org/en/14/dialects/).

The code produces database tables storing names of swimmers, volunteers, etc. To clean them, run the code with the `--clean` flag.

A `instance/secrets.py` file containing the secret key that signs user session cookies will be automatically generated if not found.

There is a default initial admin with username `admin` and password equal to the secret key of the app (in `instance/secrets.py`). **When starting the program, use this to create other admins.**

## Deployment

Example deployment using MySQL on a reverse proxy to port 4000:

```sh
python run.py --host localhost --port 4000 --database mysql+pymysql://root:password@localhost/swim4love
```

The `/socket.io` directive needs HTTP version 1.1 and the following headers reverse-proxied:
* Upgrade
* Connection 'upgrade'
* Host
* X-Forwarded-Host
* X-Forwarded-Proto

For example, in NGINX:
```nginx
server {
    ...

    location / {
        proxy_pass http://localhost:4000;
    }

    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Host $http_host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Trivia

Eventlet is automatically used. Don't use gunicorn multiple workers since it is [not supported by Flask-SocketIO](https://flask-socketio.readthedocs.io/en/latest/#gunicorn-web-server). If using single-worker gunicorn, enable `--worker-class eventlet`.

## Legacy
Pre-2019 code can be found at [yu-george/swim4love](https://github.com/yu-george/swim4love).

2019 code can be found at [commit 0b21f18](https://github.com/YKPS-FooBar/swim4love/tree/0b21f18).
