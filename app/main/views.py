from . import main
from flask import render_template


@main.route('/')
def index():
    return 'test'
