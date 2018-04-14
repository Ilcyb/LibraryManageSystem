from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app

book_author = db.Table('book_author',
                       db.Column('book_id', db.Integer, db.ForeignKey('book.book_id'), primary_key=True),
                       db.Column('author_id', db.Integer, db.ForeignKey('author.author_id'), primary_key=True))


class Permission:
    COMMENT = 0x0000001
    BAN_COMMENT = 0x0000010
    BORROWING_NOTICE = 0x0000100
    BOOK_MODIFY = 0x0001000
    ANNOUNCEMENT_MODIFY = 0x0010000
    BAN_USER = 0x0100000
    ADMINISTOR = 0x1000000


class Role(db.Model):
    __tablename__ = 'role'
    role_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    default = db.Column(db.Boolean, default=False, index=True)
    permission = db.Column(db.Integer)
    users = db.relationship('User', backref='role', lazy='dynamic')

    @staticmethod
    def insert_roles():
        roles = {
            'User': (Permission.COMMENT | Permission.BORROWING_NOTICE, True),
            'Moderator': (Permission.COMMENT | Permission.BAN_COMMENT | Permission.BOOK_MODIFY, False),
            'Administrator ': (0x1111011, False)
        }
        for r in roles:
            role = Role.query.filter_by(name=r).first()
            if role is None:
                role = Role(name=r)
            role.default = roles[r][1]
            role.permission = roles[r][0]
            db.session.add(role)
        db.session.commit()

    def __repr__(self):
        return '<Role:{}>'.format(self.name)


class Book(db.Model):
    __tablename__ = 'book'
    book_id = db.Column(db.Integer, primary_key=True)
    isbn = db.Column(db.String(17), unique=True, nullable=False)
    language = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    authors = db.relationship('Author', secondary=book_author, lazy='select',
                              backref=db.backref('books', lazy=True))
    topic = db.Column(db.String(30), nullable=False)
    publishing_house_id = db.Column(db.Integer, db.ForeignKey('publish_house.publish_house_id'), nullable=False)
    classification_id = db.Column(db.Integer, db.ForeignKey('classification.classification_id'), nullable=False)
    publish_date = db.Column(db.Integer, nullable=False)
    book_collections = db.relationship('BookCollection', backref='book', lazy=True)
    comments = db.relationship('Comment', backref='book', lazy=True)
    image = db.Column(db.String(160), nullable=False)
    call_number = db.Column(db.String(30), nullable=False)

    def __init__(self, isbn, language, name, topic,
                 publish_date, call_number, image='/static/images/BookImages/icon_book.png'):
        self.isbn = isbn
        self.language = language
        self.name = name
        self.topic = topic
        self.publish_date = publish_date
        self.call_number = call_number
        self.image = image

    def __repr__(self):
        return '<Book:{}({})>'.format(self.name, self.book_id)


class Author(db.Model):
    __tablename__ = 'author'
    author_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<Author:{}({})>'.format(self.name, self.author_id)


class BookCollection(db.Model):
    __tablename__ = 'book_collection'
    book_collection_id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.book_id'), nullable=False)
    book_name = db.Column(db.String(50), nullable=False)
    collection_address = db.Column(db.String(50), nullable=False)
    campus = db.Column(db.String(50), nullable=False)
    statu = db.Column(db.Boolean, nullable=False)  # True在藏 False借出
    lending_infos = db.relationship('LendingInfo', backref='book_collection', lazy=True)

    def __init__(self, book, book_name, collection_address, campus):
        self.book_id = book
        self.collection_address = collection_address
        self.campus = campus
        self.book_name = book_name
        self.statu = True

    def __repr__(self):
        return '<BookCollection:{}({})>'.format(self.book, self.book_collection_id)


class User(db.Model):
    __tablename__ = 'user_t'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(30), unique=True, nullable=False)
    name = db.Column(db.String(10), nullable=True)
    sex = db.Column(db.Boolean, nullable=True)  # True man False female
    insitution = db.Column(db.String(30), nullable=True)
    level_id = db.Column(db.Integer, db.ForeignKey('level_t.level_id'), nullable=True)
    lended_nums = db.Column(db.Integer, nullable=True, default=0)
    lending_infos = db.relationship('LendingInfo', backref='user', lazy=True)
    comments = db.relationship('Comment', backref='user', lazy=True)
    role_id = db.Column(db.Integer, db.ForeignKey('role.role_id'), nullable=False)

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __init__(self, username, password, email, role=None):
        self.username = username
        self.password = password
        self.email = email
        self.role = role
        if self.role is None:
            if self.username == current_app.config['ADMIN_USERNAME']:
                self.role = db.session.query(Role).filter_by(name='Administrator').first()
            else:
                self.role = db.session.query(Role).filter_by(default=True).first()
        if self.level is None:
            self.level = db.session.query(Level).filter_by(default=True).first()

    def __repr__(self):
        return '<User:{}({})>'.format(self.username, self.user_id)


class LendingInfo(db.Model):
    __tablename__ = 'lending_info'
    lending_info_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user_t.user_id'), nullable=False)
    book_collection_id = db.Column(db.Integer, db.ForeignKey('book_collection.book_collection_id'), 
                                    nullable=False, index=True)
    lend_time = db.Column(db.DateTime, default=datetime.now, nullable=False)
    return_time = db.Column(db.DateTime, nullable=True)
    expected_return_time = db.Column(db.DateTime, nullable=False)
    returned = db.Column(db.Boolean, default=False, nullable=False)
    timeout = db.Column(db.Boolean, default=False, nullable=False)  # 是否超时

    def __init__(self, user, book_collection, expected_return_time):
        self.user_id = user
        self.book_collection_id = book_collection
        self.expected_return_time = expected_return_time

    def __repr__(self):
        return '<LendingInfo:{}({})({})>'.format(self.user, self.book_collection, self.lending_info_id)


class Level(db.Model):
    __tablename__ = 'level_t'
    level_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    can_lended_nums = db.Column(db.Integer, nullable=False)
    default = db.Column(db.Boolean, nullable=False)
    users = db.relationship('User', backref='level', lazy=True)

    def __init__(self, name, can_lended_nums, default):
        self.name = name
        self.can_lended_nums = can_lended_nums
        self.default = default

    def __repr__(self):
        return '<Level:{}>'.format(self.name)

    @staticmethod
    def insert_levels():
        level_dict = {
            '本科生': (7, True),
            '研究生': (10, False),
            '博士生': (15, False),
            '教师': (20, False)
        }
        for level_key in level_dict:
            if Level.query.filter_by(name=level_key).first() is None:
                level = Level(level_key, level_dict[level_key][0], level_dict[level_key][1])
                db.session.add(level)
        db.session.commit()


class PublishHouse(db.Model):
    __tablename__ = 'publish_house'
    publish_house_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    books = db.relationship('Book', backref='publish_house', lazy=True)

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<PublishHouse:{}({})>'.format(self.name, self.publish_house_id)


class Classification(db.Model):
    __tablename__ = 'classification'
    classification_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    books = db.relationship('Book', backref='classification', lazy=True)
    upper_layer_id = db.Column(db.Integer, db.ForeignKey('classification.classification_id'), nullable=True)
    upper_layer = db.relationship('Classification', remote_side=[classification_id], backref='sub_layers', lazy=True)

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<Classification:{}>'.format(self.name)


class Comment(db.Model):
    __tablename__ = 'comment'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user_t.user_id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.book_id'), nullable=False)
    content = db.Column(db.String(140), nullable=False)
    comment_time = db.Column(db.DateTime, default=datetime.now, nullable=False)

    def __init__(self, user, book, content):
        self.user_id = user
        self.book_id = book
        self.content = content

    def __repr__(self):
        return '<Comment:({}:{})>'.format(self.user, self.book)


class Notice(db.Model):
    __tablename__ = 'notice'
    user_id = db.Column(db.Integer, nullable=False, primary_key=True)
    book_id = db.Column(db.Integer, nullable=False, primary_key=True)
    is_noticed = db.Column(db.Boolean, nullable=False, default=False)

    def __init__(self, user_id, book_id):
        self.user_id = user_id
        self.book_id = book_id

    def __repr__(self):
        return '<Notice:({}:{})>'.format(self.user_id, self.book_id)


class Announcement(db.Model):
    __tablename__ = 'announcement'
    announcement_id = db.Column(db.Integer, nullable=False, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    time = db.Column(db.DateTime, nullable=False, default=datetime.now)

    def __init__(self, title, content):
        self.title = title
        self.content = content

    def __repr__(self):
        return '<Announcement:{}>'.format(self.announcement_id)
