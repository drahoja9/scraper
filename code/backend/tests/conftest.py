"""

.. module:: tests/conftest
    :platform: Unix
    :synopsis:

.. moduleauthor:: Jakub Drahos <jakubdrahosJD@seznam.cz>

"""
import os

import pytest
from flask import Flask
from flask.testing import FlaskClient

from app import create_app


@pytest.fixture(scope='function')
def set_environment():
    """
    PyTest fixture for setting up the environment variables FLASK_ENV and SECRET_KEY to correct values.
    """
    os.environ.update({'FLASK_ENV': 'testing'})
    os.environ.update({'SECRET_KEY': 'secret_key'})


@pytest.fixture(scope='function')
def test_app(set_environment) -> Flask:
    """

    PyTest fixture for creating instance of the Flask app for each testing function.

    :return: instance of Flask

    """
    app = create_app()
    yield app


@pytest.fixture(scope='function')
def test_client(test_app) -> FlaskClient:
    """

    PyTest fixture for creating instance of testing client derived from Flask app for each testing function.

    :param test_app: instance of Flask

    :return: instance of Flask test client

    """
    with test_app.test_client() as client:
        yield client
