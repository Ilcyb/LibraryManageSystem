from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash,check_password_hash

book_author = db.Table('book_author',
                       db.Column('book_id', db.Integer, db.ForeignKey('book.book_id'), primary_key=True),
                       db.Column('author_id', db.Integer, db.ForeignKey('author.author_id'), primary_key=True))


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
    collection_address = db.Column(db.String(50), nullable=False)
    campus = db.Column(db.String(50), nullable=False)
    statu = db.Column(db.Boolean, default=True, nullable=False) #True在藏 False借出
    lending_infos = db.relationship('LendingInfo', backref='book_collection', lazy=True)

    def __init__(self, book, collection_address, campus):
        self.book_id = book
        self.collection_address = collection_address
        self.campus = campus

    def __repr__(self):
        return '<BookCollection:{}({})>'.format(self.book, self.book_collection_id)


class User(db.Model):
    __tablename__ = 'user_t'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(30), unique=True, nullable=False)
    name = db.Column(db.String(10), nullable=True)
    sex = db.Column(db.Boolean, nullable=True) #True man False female
    institution = db.Column(db.String(30), nullable=True)
    level = db.Column(db.Integer, db.ForeignKey('level_t.level_id'), nullable=True)
    lended_nums = db.Column(db.Integer, nullable=True)
    lending_infos = db.relationship('LendingInfo', backref='user', lazy=True)
    comments = db.relationship('Comment', backref='user', lazy=True)

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __init__(self, username, password, email):
        self.username = username
        self.password = password
        self.email = email

    def __repr__(self):
        return '<User:{}({})>'.format(self.username, self.user_id)


class LendingInfo(db.Model):
    __tablename__ = 'lending_info'
    lending_info_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user_t.user_id'), nullable=False)
    book_collection_id = db.Column(db.Integer, db.ForeignKey('book_collection.book_collection_id'), nullable=False)
    lend_time = db.Column(db.DateTime, default=datetime.now, nullable=False)
    return_time = db.Column(db.DateTime, nullable=True)
    expected_return_time = db.Column(db.DateTime, nullable=False)
    returned = db.Column(db.Boolean, default=False, nullable=False)
    timeout = db.Column(db.Boolean, default=False, nullable=False) # 是否超时

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

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<Level:{}>'.format(self.name)


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
    name = db.Column(db.String(30), unique=True, nullable=False)
    books = db.relationship('Book', backref='classification', lazy=True)
    upper_layer_id = db.Column(db.Integer, db.ForeignKey('classification.classification_id'), nullable=True)
    upper_layer = db.relationship('Classification', remote_side=[classification_id], backref='sub_layers', lazy=True)

    def __init__(self, name, upper_layer_id):
        self.name = name
        self.upper_layer_id = upper_layer_id

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
