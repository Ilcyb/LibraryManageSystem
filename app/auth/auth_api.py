from . import auth
from .. import db
from ..models import User, Level
from flask import request, g, session, jsonify, url_for, abort


@auth.route('/login', methods=['POST'])
def login_api():
    """
    登陆请求接口
    :url /api/user/login
    :method post
    :param username 登陆框中的用户名
    :param password 登陆框中的密码
    :return json {'login_statu':true,'page':'url'} 登陆成功  url为登陆成功后要跳转的页面url
    :return json {'login_statu':false,'error':'reason'} 登陆失败 reason为错误信息
    """
    request_json = request.get_json()
    username_or_email = request_json.get('username', None)
    password = request_json.get('password', None)
    if not (username_or_email and password):
        abort(403, '用户名或密码不能为空')
    user = User.query.filter((User.username == username_or_email)
                             | (User.email == username_or_email)).first()
    if user and user.check_password(password):
        session['username'] = user.username
        session['id'] = user.user_id
        session['login'] = True
        return jsonify({
            'login_statu': True,
            'page': request.referrer or url_for('main.index')
        }), 200
    else:
        return jsonify({'login_statu': False, 'error': '用户名或密码错误'}), 401


@auth.route('/register', methods=['POST'])
def register_api():
    """
    注册请求接口
    :url /api/user/register
    :method post
    :param username
    :param password
    :param email
    :return json {'register_statu':true,'page':'url'} 注册成功 url为注册成功后要跳转的页面url
    :return json {'register_statu':false,'error':'reason'} 注册失败 reason为错误信息
    """
    request_json = request.get_json()
    username = request_json.get('username', None)
    email = request_json.get('email', None)
    password = request_json.get('password', None)
    if not (username and email and password):
        abort(403, '用户名、邮箱、密码都不能为空')
    if User.query.filter(User.username == username).count() != 0:
        return jsonify({'register_statu': False, 'error': '此用户名已被注册'}), 200
    elif User.query.filter(User.email == email).count() != 0:
        return jsonify({'register_statu': False, 'error': '此电子邮箱已被注册'}), 200
    else:
        new_user = User(username, password, email)
        db.session.add(new_user)
        db.session.commit()
        session['username'] = new_user.username
        session['id'] = new_user.user_id
        session['login'] = True
        return jsonify({
            'register_statu': True,
            'page': request.referrer or url_for('main.index')
        }), 200


@auth.route('/isLogin', methods=['GET'])
def isLogin():
    if session.get('login', None) == True:
        if session.get('username', None) and session.get('id', None):
            return jsonify({
                'is_login': True,
                'username': session['username'],
                'id': session['id']
            }), 200
        else:
            session.clear()  # session信息遭到破坏不完整，清除session信息
            return jsonify({'is_login': False}), 403
    else:
        return jsonify({'is_login': False}), 200


@auth.route('/logout', methods=['GET'])
def logout():
    session.clear()
    return jsonify({'page': request.referrer or url_for('main.index')}), 200


@auth.route('/personalInfo', methods=['GET'])
def personal_info():
    user = db.session.query(User).filter_by(user_id=session.get('id', None)).first()
    if user is None:
        abort(404, '用户不存在')
    level = db.session.query(Level).filter_by(level_id=user.user_id).first()
    user_json = {
        'username': user.username,
        'email': user.email,
        'name': user.name,
        'sex': user.sex,
        'insitution': user.insitution,
        'level': level.name,
        'can_lended_nums': level.can_lended_nums,
        'lended_nums': user.lended_nums
    }
    return jsonify(user_json), 200
