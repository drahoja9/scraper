"""

.. module:: tests/test_views
    :platform: Unix
    :synopsis:

.. moduleauthor:: Jakub Drahos <jakubdrahosJD@seznam.cz>

"""
from flask.testing import FlaskClient


def test_process_request(test_client: FlaskClient):
    data = {
        'data': 'some random data',
        'payload': 'some random payload'
    }
    response = test_client.post('/api/scrape', follow_redirects=True, json=data)
    assert response.status_code == 200
    assert response.json == data


def test_invalid_process_request(test_client: FlaskClient):
    response = test_client.post('/api/scrape', follow_redirects=True)
    assert response.status_code == 400
    assert b'Bad Request' in response.data

    response = test_client.post('/api/scrape', follow_redirects=True, json={})
    assert response.status_code == 400
    assert b'Bad Request' in response.data
