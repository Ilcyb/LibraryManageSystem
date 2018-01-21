from . import main
from flask import render_template


@main.app_errorhandler(404)
def not_found(error):
    return render_template('404_not_found.html', error=error), 404


@main.app_errorhandler(403)
def bad_request(error):
    return render_template('403_bad_request.html', error=error), 403


@main.app_errorhandler(500)
def server_error(error):
    return render_template('500_server_error.html', error=error), 500