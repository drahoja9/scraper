"""

.. module:: app/views
    :platform: Unix
    :synopsis:

.. moduleauthor:: Jakub Drahos <jakubdrahosJD@seznam.cz>

"""
from flask import Blueprint, request, jsonify, abort

bp = Blueprint('api', __name__, url_prefix='/api')


@bp.route('/scrape', methods=['POST'])
def process_request():
    data = request.get_json()
    if not data:
        return abort(400)
    return jsonify(data), 200
