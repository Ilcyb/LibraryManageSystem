from . import main
from flask import render_template


@main.route('/')
def index():
    return render_template('index.html')

@main.route('/login')
def login():
    return render_template('login.html')

@main.route('/register')
def register():
    return render_template('register.html')

@main.route('/searchResult')
def search_result():
    return render_template('searchResult.html')