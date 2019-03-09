"""

Configuration module storing various variables for Flask app defined in app module (__init__.py).

.. module:: app/config
    :platform: Unix
    :synopsis: Configuration module for Flask app defined in app module (__init__.py).

.. moduleauthor:: Jakub Drahos <jakubdrahosJD@seznam.cz>

"""
import os


class BaseConfig:
    TESTING = False
    DEBUG = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
    PREFERRED_URL_SCHEME = 'https'

    if not SECRET_KEY:
        raise ValueError('No secret key set for Flask application!')


class ProductionConfig(BaseConfig):
    pass


class DevelopmentConfig(BaseConfig):
    DEBUG = True


class TestingConfig(BaseConfig):
    TESTING = True
