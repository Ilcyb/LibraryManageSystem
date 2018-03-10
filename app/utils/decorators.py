from flask import session, url_for

def login_required(func):
    def handle_args(*args, **kwargs):
        if session.get('login', None) == True:
            return func(*args, **kwargs)
        else:
            return url_for('main.login')

def admin_required(func):
    def handle_args(*args, **kwargs):
        if session.get('isAdmin', None) == True:
            return func(*args, **kwargs)
        else:
            return url_for('admin.admin_login')