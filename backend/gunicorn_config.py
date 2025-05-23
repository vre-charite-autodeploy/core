# Copyright 2022 Indoc Research
# 
# Licensed under the EUPL, Version 1.2 or – as soon they
# will be approved by the European Commission - subsequent
# versions of the EUPL (the "Licence");
# You may not use this work except in compliance with the
# Licence.
# You may obtain a copy of the Licence at:
# 
# https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
# 
# Unless required by applicable law or agreed to in
# writing, software distributed under the Licence is
# distributed on an "AS IS" basis,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.
# See the Licence for the specific language governing
# permissions and limitations under the Licence.
# 

# gunicorn_config.py
preload_app = True

import gevent.monkey

gevent.monkey.patch_all()
bind = '0.0.0.0:5060'
daemon = 'false'
# worker config
# worker_class = 'gevent'
workers = 4
threads = 4
worker_connections = 1200
# accesslog = 'gunicorn_access.log'
# errorlog = 'gunicorn_error.log'
loglevel = 'debug'
