#!/bin/sh
set -e

python manage.py migrate --no-input
python manage.py collectstatic --no-input
python manage.py seed_catalogo

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
