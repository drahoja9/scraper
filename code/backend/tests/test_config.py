"""

.. module:: tests/test_config
    :platform: Unix
    :synopsis:

.. moduleauthor:: Jakub Drahos <jakubdrahosJD@seznam.cz>

"""
import os

import pytest

from app import create_app


def test_development_config(set_environment):
    os.environ.update({'FLASK_ENV': 'development'})
    app = create_app()
    assert app.config['TESTING'] is False
    assert app.config['DEBUG'] is True


def test_testing_config(set_environment):
    os.environ.update({'FLASK_ENV': 'testing'})
    app = create_app()
    assert app.config['TESTING'] is True
    assert app.config['DEBUG'] is False


def test_production_config(set_environment):
    os.environ.update({'FLASK_ENV': 'production'})
    app = create_app()
    assert app.config['TESTING'] is False
    assert app.config['DEBUG'] is False


def test_invalid_flask_env(set_environment):
    os.environ.update({'FLASK_ENV': 'tesssting'})
    with pytest.raises(ValueError):
        create_app()


def test_missing_flask_env(set_environment):
    del os.environ['FLASK_ENV']
    with pytest.raises(ValueError):
        create_app()
