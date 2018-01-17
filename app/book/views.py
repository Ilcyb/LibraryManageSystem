from . import book
from .. import db
from ..models import Book, PublishHouse, Classification, Author
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker
from flask import request, jsonify, current_app


@book.route('/search', methods=['GET'])
def book_search():
    book_name = request.args.get('name', None)
    author_name = request.args.get('author', None)
    publish_house = request.args.get('publishhouse', None)
    isbn = request.args.get('isbn', None)
    all_filed = request.args.get('allfiled', None)

    q = Book.query()
    if all_filed:
        books = q.filter(or_(Book.name.ilike('%' + book_name + '%'),
                             author_name in [author.name for author in Book.authors],
                             Book.publish_house.name == publish_house, Book.isbn == isbn)).all()
        returned_dict = {}
        returned_dict['lengths'] = len(books)
        returned_dict['keyword'] = all_filed
        books_list = []
        for book in books:
            book_dict = {}
            book_dict['id'] = book.book_id
            book_dict['isbn'] = book.isbn
            book_dict['language'] = book.language
            book_dict['name'] = book.name
            book_dict['authors'] = [author.name for author in book.authors]
            book_dict['topic'] = book.topic
            book_dict['publish_house'] = book.publish_house.name
            book_dict['classification'] = book.classification.name
            book_dict['publish_date'] = book.publish_date
            book_dict['book_collections_nums'] = len(book.book_collections)
            book_dict['borrowable_collections_nums'] = \
                len([collection for collection in book.book_collections if collection.statu == True])
            book_dict['call_number'] = book.call_number
            books_list.append(book_dict)
        return jsonify(returned_dict), 200
    if book_name:
        q = q.filter(Book.name.ilike('%' + book_name + '%'))
    if author_name:
        q = q.filter(author_name in [author.name for author in Book.authors])
    if publish_house:
        q = q.filter(Book.publish_house.name == publish_house)
    if isbn:
        q = q.filter(Book.isbn == isbn)
    books = q.all()
    returned_dict = {}
    returned_dict['lengths'] = len(books)
    returned_dict['keyword'] = book_name or author_name or publish_house or isbn
    books_list = []
    for book in books:
        book_dict = {}
        book_dict['id'] = book.book_id
        book_dict['isbn'] = book.isbn
        book_dict['language'] = book.language
        book_dict['name'] = book.name
        book_dict['authors'] = [author.name for author in book.authors]
        book_dict['topic'] = book.topic
        book_dict['publish_house'] = book.publish_house.name
        book_dict['classification'] = book.classification.name
        book_dict['publish_date'] = book.publish_date
        book_dict['book_collections_nums'] = len(book.book_collections)
        book_dict['borrowable_collections_nums'] = \
            len([collection for collection in book.book_collections if collection.statu == True])
        book_dict['call_number'] = book.call_number
        books_list.append(book_dict)
    return jsonify(returned_dict), 200


@book.route('/book', methods=['POST'])
def create_new_book():
    """
    新建图书接口
    :url /api/book/book
    :method post
    :param isbn isbn号
    :param language 语种
    :param authors 作者 可以有多位作者
    :param topic 主题
    :param publish_house 出版社
    :param classification 分类 分类需选择已有的分类，若是数据库中没有的分类，则会请求失败
    :param publish_date 出版年份
    :param call_number 索书号
    :param image 图书图片地址(可选)
    :return json {'created':True,
                  'created_book':{
                      'id':     ,
                      'isbn':   ,
                      'language':   ,
                      'name':   ,
                      'topic':  ,
                      'classification':  ,
                      'publish_house':   ,
                  }} 创建成功
    :return json {'created':False,'reason':reason} 创建失败，reason为失败原因
    """
    isbn = request.form['isbn']
    language = request.form['language']
    name = request.form['name']
    authors = request.form.getlist('authors')
    topic = request.form['topic']
    publish_house_name = request.form['publish_house']
    classification_name = request.form['classification']
    publish_date = request.form['publish_date']
    call_number = request.form['call_number']
    image = request.form.get('image', None)

    if not (isbn and language and name and authors and topic and publish_house_name and \
    classification_name and publish_date and call_number):
        return jsonify({'created': False, 'reason': '缺少创建书籍的必要信息'}), 403

    try:
        engine = create_engine(current_app.config['SQLALCHEMY_DATABASE_URI'])
        Session = sessionmaker(bind=engine, autoflush=False)
        session = Session()
    except Exception as e:
        print(e)
        return jsonify({'created': False, 'reason': '服务器发生错误'}), 500

    returned_book = {}
    try:
        classification = session.query(Classification).filter_by(name=classification_name).first()
        if not classification:
            return jsonify({'created': False, 'reason': '该分类不存在，书籍资料创建失败'}), 403
        returned_book['classification'] = classification.name

        publish_house = session.query(PublishHouse).filter_by(name=publish_house_name).first()
        if not publish_house:  # 如果数据库中没有这个出版社的话，则创建该出版社的信息
            publish_house = PublishHouse(publish_house_name)
            session.add(publish_house)
        returned_book['publish_house'] = publish_house.name

        new_book = Book(isbn, language, name, topic, publish_date, call_number) if image is None else \
            Book(isbn, language, name, topic, publish_date, call_number, image)

        returned_book['authors'] = []
        for author_name in authors:
            author = session.query(Author).filter_by(name=author_name).first()
            if not author:
                new_author = Author(author_name)
                session.add(new_author)
                new_book.authors.append(new_author)
            else:
                new_book.authors.append(author)
            returned_book['authors'].append(author_name)

        classification.books.append(new_book)
        publish_house.books.append(new_book)
        session.add(new_book)
        session.commit()
        returned_book['id'] = new_book.book_id
        returned_book['isbn'] = new_book.isbn
        returned_book['language'] = new_book.language
        returned_book['name'] = new_book.name
        returned_book['topic'] = new_book.topic
        returned_book['publish_date'] = new_book.publish_date
    except Exception as e:
        session.rollback()
        print(e)
        return jsonify({'created': False, 'reason': '服务器发生错误'}), 500
    finally:
        session.close()

    return jsonify({'created':True, 'created_book':returned_book}), 201
