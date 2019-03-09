"""

.. module:: app/__init__
    :platform: Unix
    :synopsis:

.. moduleauthor:: Jakub Drahos <jakubdrahosJD@seznam.cz>

"""
import os

from flask import Flask
from flask_cors import CORS


def create_app(testing_config=None):
    # Defining the app
    app = Flask(__name__)
    # cors = CORS(app, resources={r'/*': {'origins': '*'}})

    config = {
        'development': 'app.config.DevelopmentConfig',
        'testing': 'app.config.TestingConfig',
        'production': 'app.config.ProductionConfig'
    }

    flask_env = os.getenv('FLASK_ENV')
    if flask_env not in config.keys():
        raise ValueError('Invalid FLASK_ENV environment variable!')

    # Loading configuration from config.py depending on FLASK_APP env var (e.g. passed through Docker)
    app.config.from_object(config[flask_env])
    # When testing_config is present, override any previous configuration
    if testing_config:
        app.config.from_mapping(testing_config)

    from app.views import bp
    app.register_blueprint(bp)

    return app
