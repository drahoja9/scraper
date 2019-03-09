"""

.. module:: tests/__init__
    :platform: Unix
    :synopsis:

.. moduleauthor:: Jakub Drahos <jakubdrahosJD@seznam.cz>

"""
import os
import sys

APP_ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# In order to be able to import the main package, we must append it's absolute path to system's PATH
sys.path.insert(0, APP_ROOT_DIR)
