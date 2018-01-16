from . import auth
from .. import db
from ..models import User
from flask import request, g, session, jsonify, url_for

@auth.route('/login', methods=['POST'])
def login_api():
    """
    登陆请求接口
    :url /api/auth/login
    :method post
    :param username 登陆框中的用户名
    :param password 登陆框中的密码
    :return json {'login_statu':1,'page':'url'} 登陆成功  url为登陆成功后要跳转的页面url
    :return json {'login_statu':0,'error':'reason'} 登陆失败 reason为错误信息
    """
    username_or_email = request.form['username']
    password = request.form['password']
    user = User.query.filter((User.username == username_or_email) | (User.email == username_or_email)).first()
    if user and user.check_password(password):
        session['username'] = user.username
        session['id'] = user.user_id
        session['login'] = True
        return jsonify({'login_statu':1, 'page':request.referrer or url_for('main.index')}), 200
    else:
        return jsonify({'login_statu':0,'error':'用户名或密码错误'}), 401

@auth.route('/register', methods=['POST'])
def register_api():
    """
    注册请求接口
    :url /api/auth/register
    :method post
    :param username
    :param password
    :param email
    :return json {'register_statu':1,'page':'url'} 注册成功 url为注册成功后要跳转的页面url
    :return json {'register_statu':0,'error':'reason'} 注册失败 reason为错误信息
    """
    username = request.form['username']
    email = request.form['email']
    password = request.form['password']
    if User.query.filter(User.username == username).count() != 0:
        return jsonify({'register_statu':0, 'error':'此用户名已被注册'}), 200
    elif User.query.filter(User.email == email).count() != 0:
        return jsonify({'register_statu':0, 'error':'此电子邮箱已被注册'}), 200
    else:
        new_user = User(username, password, email)
        db.session.add(new_user)
        db.session.commit()
        user = User.query.filter(User.username == username).first()
        session['username'] = user.username
        session['id'] = user.user_id
        session['login'] = True
        return jsonify({'register_statu':1, 'page':request.referrer or url_for('main.index')}), 200
