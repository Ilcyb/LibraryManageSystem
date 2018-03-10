from . import auth
from .. import db
from ..models import User, Level, LendingInfo, Book, BookCollection, Comment, Announcement
from flask import request, g, session, jsonify, url_for, abort, current_app
import datetime
from sqlalchemy import desc, and_, or_


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
        # 避免跳转回登录页面
        referrer = request.referrer
        if referrer is not None and 'login' in referrer:
            referrer = url_for('main.index')
        return jsonify({
            'login_statu': True,
            'page': referrer or url_for('main.index')
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
        # 避免跳转回注册页面
        referrer = request.referrer
        if referrer is not None and 'register' in referrer:
            referrer = url_for('main.index')
        return jsonify({
            'register_statu': True,
            'page': referrer or url_for('main.index')
        }), 200


@auth.route('/isLogin', methods=['GET'])
def isLogin():
    if session.get('login', None) == True:
        if session.get('username', None) and session.get('id', None):
            return jsonify({
                'is_login': True,
                'username': session['username'],
                'url': url_for('main.my_library'),
                'logout_url': url_for('auth.logout')
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


@auth.route('/adminLogin', methods=['POST'])
def admin_login():
    request_data = request.get_json()
    username = request_data.get('username')
    password = request_data.get('password')
    the_user = db.session.query(User).filter(or_(User.username==username,
                                    User.email==username)).first()
    if the_user == None:
        return jsonify({'login_statu': False, 'reason':'用户名或密码错误'}), 401
    if the_user.check_password(password) and the_user.role.name != 'User':
        session['username'] = username
        session['id'] = the_user.user_id
        session['login'] = True
        session['isAdmin'] = True
        return jsonify({'login_statu': True, 'url': url_for('admin.manage_book')}), 200


@auth.route('/adminInfo', methods=['GET'])
def get_admin_info():
    if session['isAdmin'] == True:
        return jsonify({'adminName':session['username']}), 200
    else:
        return jsonify({'reason':'Not admin'}), 403


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


@auth.route('/lending_history', methods=['GET'])
def lending_history():
    user = db.session.query(User).filter_by(user_id=session.get('id', None)).first()
    if user is None:
        abort(404, '用户不存在')
    page = request.args.get('page', 1)
    lending_infos = db.session.query(LendingInfo).filter_by(user_id=user.user_id)\
                        .order_by(LendingInfo.lend_time)\
                        .limit(current_app.config['DEFAULT_SEARCH_RESULT_PER_PAGE'])\
                        .offset((page - 1) * current_app.config['DEFAULT_SEARCH_RESULT_PER_PAGE']).all()
    returned_json = {'length': len(lending_infos)}
    lendinfo_list = []
    for i in range(len(lending_infos)):
        lendinfo_json = {}
        lendinfo_json['lending_info_id'] = lending_infos[i].lending_info_id
        lendinfo_json['book_name'] = db.session.query(BookCollection.book_name)\
                        .filter_by(book_collection_id=lending_infos[i].book_collection_id).first()
        lendinfo_json['lend_time'] = lending_infos[i].lend_time
        lendinfo_json['returned'] = lending_infos[i].returned
        if lendinfo_json['returned']:
            lendinfo_json['return_time'] = lending_infos[i].return_time
        else:
            lendinfo_json['expected_return_time'] = lending_infos[i].expected_return_time
        lendinfo_list.append(lendinfo_json)
    returned_json['lend_info'] = lendinfo_list
    return jsonify(returned_json), 200


@auth.route('/renew/<int:lending_info_id>', methods=['GET'])
def renew_borrow(lending_info_id):
    lending_info = db.session.query(LendingInfo).filter_by(lending_info_id=lending_info_id).first()
    if lending_info == None:
        return jsonify({'reason': '此借阅记录不存在，续借失败'}), 404
    if lending_info.user_id != session['id']:
        return jsonify({'reason': '此借阅记录不是当前用户的借阅记录，续借失败'}), 403
    lending_info.expected_return_time += datetime.timedelta(days=current_app.config['DEFAULT_BOOK_BORROW_TIME'])
    db.session.commit()
    return '续借成功', 200


@auth.route('/new_comment', methods=['POST'])
def create_new_comment():
    request_data = request.get_json()
    book_id = request_data.get('book_id')
    content = request_data.get('comment_content')
    new_comment = Comment(session['id'], book_id, content)
    db.session.add(new_comment)
    return '评论成功', 200


@auth.route('/comment_history', methods=['GET'])
def get_history_comments():
    user = db.session.query(User).filter_by(user_id=session.get('id', None)).first()
    if user is None:
        abort(404, '用户不存在')
    page = request.args.get('page', 1)
    comments = db.session.query(Comment).filter_by(user_id=user.user_id)\
                        .order_by(Comment.comment_time)\
                        .limit(current_app.config['DEFAULT_SEARCH_RESULT_PER_PAGE'])\
                        .offset((page - 1) * current_app.config['DEFAULT_SEARCH_RESULT_PER_PAGE']).all()
    returned_json = {'length': len(comments)}
    comments_list = []
    for i in range(len(comments)):
        comment_json = {}
        comment_json['book_id'] = comments[i].book_id
        comment_json['content'] = comments[i].content
        comment_json['comment_time'] = comments[i].comment_time
        comments_list.append(comment_json)
    returned_json['comments'] = comments_list
    return jsonify(returned_json), 200


@auth.route('/addAnnouncement', methods=['POST'])
def add_announcement():
    try:
        request_data = request.get_json()
        title = request_data.get('title')
        content = request_data.get('content')
        new_announcement = Announcement(title, content)
        db.session.add(new_announcement)
        db.session.commit()
    except Exception as e:
        print(e)
        return jsonify({'created': False, 'error': '服务器错误，添加失败'}), 403
    return jsonify({'created': True, 'announcement': 
            {'title': new_announcement.title, 'content':new_announcement.content}}), 201


@auth.route('/getAnnouncement', methods=['GET'])
def get_announcement():
    announcements = db.session.query(Announcement).order_by(desc(Announcement.time)).limit(5).all()
    returned_json = {'length': len(announcements)}
    announcements_list = []
    for i in range(len(announcements)):
        announcement_dcit = {}
        announcement_dcit['title'] = announcements[i].title
        announcement_dcit['url'] = url_for('main.get_announcement', ann_id=announcements[i].announcement_id)
        announcements_list.append(announcement_dcit)
    returned_json['announcements'] = announcements_list
    return jsonify(returned_json), 200
