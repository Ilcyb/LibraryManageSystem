from flask import session, url_for

def login_required(func):
    def handle_args(*args, **kwargs):
        if session.get('login', None) == True:
            return func(*args, **kwargs)
        else:
            return url_for('main.login')