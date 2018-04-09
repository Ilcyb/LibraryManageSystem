from flask import session, url_for, redirect
from functools import wraps

def login_required(func):
    @wraps(func)
    def handle_args(*args, **kwargs):
        if session.get('login', None) == True:
            return func(*args, **kwargs)
        else:
            return redirect(url_for('main.login'))
    return handle_args

def admin_required(func):
    @wraps
    def handle_args(*args, **kwargs):
        if session.get('isAdmin', None) == True:
            return func(*args, **kwargs)
        else:
            return redirect(url_for('admin.admin_login'))
    return handle_args