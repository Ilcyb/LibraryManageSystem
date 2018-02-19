from flask import abort, current_app, jsonify, request, session
from sqlalchemy import create_engine, desc, or_
from sqlalchemy.orm import sessionmaker

from . import book
from .. import db
from ..models import Author, Book, Classification, PublishHouse, \
                    book_author, BookCollection, LendingInfo, User, Notice
from ..utils.bookSortEnum import bookSortEnum


def fill_book_info_to_dict(book, book_dict):
    """
    若标明了返回的格式是书籍常规格式，则返回如下格式的json数据
    'book':{
                'id':     ,
                'isbn':   ,
                'language':   ,
                'name':   ,
                'topic':  ,
                'classification':  ,
                'publish_house':   ,
                'call_number':     ,
                'image':  ,
                }
    """
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
    book_dict['image'] = book.image


@book.route('/<int:book_id>', methods=['GET'])
def get_book_by_id(book_id):
    """
    根据书籍id获取书籍信息
    :url /api/book/:id
    :method get
    :param id 书籍id
    :return json {'book':书籍常规格式}
    """
    try:
        book = Book.query.get(book_id)
    except Exception as e:
        print(e)
        abort(500)
    if book is None:
        abort(404)
    book_dict = {}
    fill_book_info_to_dict(book, book_dict)
    return jsonify({'book': book_dict}), 200


@book.route('/isbn/<string:isbn>', methods=['GET'])
def get_book_by_isbn(isbn):
    """
    根据书籍isbn号获取书籍信息
    :url /api/book/isbn/:isbn
    :method get
    :param isbn 书籍isbn号
    :return json {'book':书籍常规格式}
    """
    try:
        book = Book.query.filter_by(isbn=isbn).first()
    except Exception as e:
        print(e)
        abort(500)
    if book is None:
        abort(404)
    book_dict = {}
    fill_book_info_to_dict(book, book_dict)
    return jsonify({'book': book_dict}), 200


@book.route('/searchByBookName/<string:name>', methods=['GET'])
def get_books_by_name(name):
    # TODO:是否能用上迭代器
    """
    根据书籍名查找书籍
    :url /api/book/searchByBookName/:name
    :method get
    :param name 书籍名
    :param perpage 每页显示多少条数据
    :param page 显示第几页
    :param sortfield 排序方式
    :param isdesc 是否倒序
    :return json {'books':书籍常规格式列表,'keyword':搜索关键字,'length':搜索结果长度}
    """
    try:
        # 每页显示多少条数据
        per_page = int(
            request.args.get(
                'perpage',
                current_app.config['DEFAULT_SEARCH_RESULT_PER_PAGE']))
        # 查询偏移量
        offset = (int(request.args.get('page', 1)) - 1) * per_page
        # 排序方式
        sort_field = request.args.get('sortfield', 'book_id')
        # 排序是否倒序
        isdesc = request.args.get('isdesc', False)

        books = Book.query.filter(Book.name.ilike('%' + name + '%')) \
            .order_by(bookSortEnum[sort_field] if not isdesc else desc(bookSortEnum[sort_field])) \
            .limit(per_page).offset(offset).all()
    except ValueError:
        abort(403)
    except Exception as e:
        print(e)
        abort(500)

    returned_json = {}
    returned_json['books'] = []
    for book in books:
        book_dict = {}
        fill_book_info_to_dict(book, book_dict)
        returned_json['books'].append(book_dict)
    returned_json['length'] = len(books)
    returned_json['keyword'] = name
    return jsonify(returned_json), 200


@book.route('/searchByAuthor/<string:name>', methods=['GET'])
def get_books_by_author(name):
    """
    根据作者名查找书籍
    :url /api/book/searchByAuthor/:name
    :method get
    :param name 作者名
    :param perpage 每页显示多少条数据
    :param page 显示第几页
    :param sortfield 排序方式
    :param isdesc 是否倒序
    :return json {'books':书籍常规格式列表,'keyword':搜索关键字,'length':搜索结果长度}
    """
    try:
        # 每页显示多少条数据
        per_page = int(
            request.args.get(
                'perpage',
                current_app.config['DEFAULT_SEARCH_RESULT_PER_PAGE']))
        # 查询偏移量
        offset = (int(request.args.get('page', 1)) - 1) * per_page
        # 排序方式
        sort_field = request.args.get('sortfield', 'book_id')
        # 排序是否倒序
        isdesc = request.args.get('isdesc', False)

        books = Book.query.join(Author, Book.authors) \
            .filter(Author.name.ilike('%' + name + '%')) \
            .order_by(bookSortEnum[sort_field] if not isdesc else desc(bookSortEnum[sort_field])) \
            .all()[offset:offset + per_page]
    except ValueError:
        abort(403)
    except Exception as e:
        print(e)
        abort(500)

    returned_json = {}
    returned_json['books'] = []
    for book in books:
        book_dict = {}
        fill_book_info_to_dict(book, book_dict)
        returned_json['books'].append(book_dict)
    returned_json['length'] = len(books)
    returned_json['keyword'] = name
    return jsonify(returned_json), 200


@book.route('/searchByPublishHouse/<string:name>', methods=['GET'])
def get_books_by_publish_house(name):
    """
    根据出版社查找书籍
    :url /api/book/searchByPublishHouse/:name
    :method get
    :param name 出版社
    :param perpage 每页显示多少条数据
    :param page 显示第几页
    :param sortfield 排序方式
    :param isdesc 是否倒序
    :return json {'books':书籍常规格式列表,'keyword':搜索关键字,'length':搜索结果长度}
    """
    try:
        # 每页显示多少条数据
        per_page = int(
            request.args.get(
                'perpage',
                current_app.config['DEFAULT_SEARCH_RESULT_PER_PAGE']))
        # 查询偏移量
        offset = (int(request.args.get('page', 1)) - 1) * per_page
        # 排序方式
        sort_field = request.args.get('sortfield', 'book_id')
        # 排序是否倒序
        isdesc = request.args.get('isdesc', False)

        books = Book.query.join(PublishHouse, Book.publish_house) \
            .filter(PublishHouse.name.ilike('%' + name + '%')) \
            .order_by(bookSortEnum[sort_field] if not isdesc else desc(bookSortEnum[sort_field])) \
            .limit(per_page).offset(offset).all()
    except ValueError:
        abort(403)
    except Exception as e:
        print(e)
        abort(500)

    returned_json = {}
    returned_json['books'] = []
    for book in books:
        book_dict = {}
        fill_book_info_to_dict(book, book_dict)
        returned_json['books'].append(book_dict)
    returned_json['length'] = len(books)
    returned_json['keyword'] = name
    return jsonify(returned_json), 200


@book.route('/searchByTopic/<string:name>', methods=['GET'])
def get_boos_by_topic(name):
    """
    根据主题查找书籍
    :url /api/book/searchByTopic/:name
    :method get
    :param name 主题
    :param perpage 每页显示多少条数据
    :param page 显示第几页
    :param sortfield 排序方式
    :param isdesc 是否倒序
    :return json {'books':书籍常规格式列表,'keyword':搜索关键字,'length':搜索结果长度}
    """
    try:
        # 每页显示多少条数据
        per_page = int(
            request.args.get(
                'perpage',
                current_app.config['DEFAULT_SEARCH_RESULT_PER_PAGE']))
        # 查询偏移量
        offset = (int(request.args.get('page', 1)) - 1) * per_page
        # 排序方式
        sort_field = request.args.get('sortfield', 'book_id')
        # 排序是否倒序
        isdesc = request.args.get('isdesc', False)

        books = Book.query.filter(Book.topic == name) \
            .order_by(bookSortEnum[sort_field] if not isdesc else desc(bookSortEnum[sort_field])) \
            .limit(per_page).offset(offset).all()
    except ValueError:
        abort(403)
    except Exception as e:
        print(e)
        abort(500)

    returned_json = {}
    returned_json['books'] = []
    for book in books:
        book_dict = {}
        fill_book_info_to_dict(book, book_dict)
        returned_json['books'].append(book_dict)
    returned_json['length'] = len(books)
    returned_json['keyword'] = name
    return jsonify(returned_json), 200


@book.route('/searchAllField/<string:name>', methods=['GET'])
def get_books_by_all_field(name):
    """
    根据全字段查找书籍
    :url /api/book/searchAllField/:name
    :method get
    :param name 搜索关键字
    :param perpage 每页显示多少条数据
    :param page 显示第几页
    :param sortfield 排序方式
    :param isdesc 是否倒序
    :return json {'books':书籍常规格式列表,'keyword':搜索关键字,'length':搜索结果长度}
    """
    try:
        # 每页显示多少条数据
        per_page = int(
            request.args.get(
                'perpage',
                current_app.config['DEFAULT_SEARCH_RESULT_PER_PAGE']))
        # 查询偏移量
        offset = (int(request.args.get('page', 1)) - 1) * per_page
        # 排序方式
        sort_field = request.args.get('sortfield', 'book_id')
        # 排序是否倒序
        isdesc = request.args.get('isdesc', False)

        books = Book.query.join(Author, Book.authors).join(PublishHouse, Book.publish_house) \
            .filter(or_(Book.name.ilike('%' + name + '%'),
                        Author.name.ilike('%' + name + '%'),
                        PublishHouse.name.ilike('%' + name + '%'),
                        Book.isbn == name,
                        Book.topic == name)) \
            .order_by(bookSortEnum[sort_field] if not isdesc else desc(bookSortEnum[sort_field])) \
            .all()[offset:offset+per_page]
    except ValueError:
        abort(403)
    except Exception as e:
        print(e)
        abort(500)

    returned_json = {}
    returned_json['books'] = []
    for book in books:
        book_dict = {}
        fill_book_info_to_dict(book, book_dict)
        returned_json['books'].append(book_dict)
    returned_json['length'] = len(books)
    returned_json['keyword'] = name
    return jsonify(returned_json), 200


@book.route('/book', methods=['POST'])
def create_new_book():
    """
    新建图书接口
    :url /api/book/book
    :method post
    :param isbn isbn号
    :param language 语种
    :param name 书名
    :param authors 作者 可以有多位作者
    :param topic 主题
    :param publish_house 出版社
    :param classification 分类 分类需选择已有的分类，若是数据库中没有的分类，则会请求失败
    :param publish_date 出版年份
    :param call_number 索书号
    :param image 图书图片地址(可选)
    :return json {'created':True,
                  'created_book':{书籍常规格式}} 创建成功
    :return json {'created':False,'reason':reason} 创建失败，reason为失败原因
    """
    request_json = request.get_json()
    isbn = request_json.get('isbn')
    language = request_json.get('language')
    name = request_json.get('name')
    authors = request_json.get('authors')
    topic = request_json.get('topic')
    publish_house_name = request_json.get('publish_house')
    classification_name = request_json.get('classification')
    publish_date = request_json.get('publish_date')
    call_number = request_json.get('call_number')
    image = request_json.get('image', None)

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
        same_isbn = session.query(Book).filter_by(isbn=isbn).first()
        if same_isbn is not None:
            return jsonify({
                'created': False,
                'reason': 'ISBN号重复，书籍资料创建失败'
            }), 403

        classification = session.query(Classification).filter_by(
            name=classification_name).first()
        if not classification:
            return jsonify({
                'created': False,
                'reason': '该分类不存在，书籍资料创建失败'
            }), 403
        returned_book['classification'] = classification.name

        publish_house = session.query(PublishHouse).filter_by(
            name=publish_house_name).first()
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
        returned_book['call_number'] = new_book.call_number
        returned_book['image'] = new_book.image
    except Exception as e:
        session.rollback()
        print(e)
        return jsonify({'created': False, 'reason': '服务器发生错误'}), 500
    finally:
        session.close()

    return jsonify({'created': True, 'created_book': returned_book}), 201


@book.route('/classification', methods=['POST'])
def create_new_classification():
    """
    新建图书分类接口
    :url /api/book/classification
    :method post
    :param classification_name 分类名
    :param upper_classification_name 上级分类名（可选）
    :return {'created':true, 'classification':{'id','name','upper_classification'}}
    """
    data = request.get_json()
    classification_name = data.get('classification_name')
    upper_classification_name = data.get('upper_classification_name', None)

    if not classification_name:
        abort(403)

    try:
        engine = create_engine(current_app.config['SQLALCHEMY_DATABASE_URI'])
        Session = sessionmaker(bind=engine, autoflush=False)
        session = Session()
    except Exception as e:
        print(e)
        abort(500)

    try:
        new_classification = Classification(classification_name)
        upper_classification = None
        if upper_classification_name is not None:
            upper_classification = session.query(Classification).filter_by(
                name=upper_classification_name).first()
            if upper_classification is None:
                abort(403, '父级分类不存在，创建失败')
            else:
                upper_classification.sub_layers.append(new_classification)
        session.add(new_classification)
        session.commit()

        returned_dict = {
            'created': True,
            'classification': {
                'id':
                    new_classification.classification_id,
                'name':
                    new_classification.name,
                'upper_classification':
                    upper_classification.name if upper_classification is not None else None
            }
        }
    except Exception as e:
        print(e)
        abort(500)
    finally:
        session.close()

    return jsonify(returned_dict), 200

@book.route('/create_new_book_collection/<int:book_id>', methods=['POST'])
def create_new_book_collection(book_id):
    """
    创建新的图书藏本接口
    :url /api/book/create_new_book_collection/:book_id 
    :method post
    :param book_id 要创建藏本的书籍的id
    :param collection_address 馆藏地址
    :param campus 校区
    :return {'created', 'book_id', 'book_collection':{'collection_address', 'campus'}}
    created 是否创建成功
    book_id 创建的藏本的图书的id
    book_collection 创建的藏本的信息
    collection_address 馆藏地址
    campus 校区
    """
    book = db.session.query(Book).filter_by(book_id=book_id).first()
    if book == None:
        return jsonify({'created': False}), 404
    request_json = request.get_json()    
    collection_address = request_json.get('collection_address', None)
    campus = request_json.get('campus', None)
    new_book_collection = BookCollection(book_id, collection_address, campus)
    db.session.add(new_book_collection)
    book.book_collections.add(new_book_collection)
    db.session.commit()
    return jsonify({'created': True,
                    'book_id': book.book_id,
                    'book_collection': {
                        'collection_address': collection_address,
                        'campus': campus
                    }})
                    
@book.route('/book_collections/<int:book_id>', methods=['GET'])
def get_book_collections(book_id):
    """
    获取某本图书的所有藏本信息接口
    :url /api/book/book_collections/:book_id
    :method get
    :param book_id 图书id
    :return {'length', 'book_collections':{
        'book_collection_id', 'collection_address', 'campus', 'statu'
    }}
    length 藏本的数量
    book_collections 藏本集合
    book_collection_id 藏本id
    collection_address 馆藏地址
    campus 校区
    statu 藏本状态
    """
    book = db.session.query(Book).filter_by(book_id=book_id).first()
    if book == None:
        return jsonify({}), 404
    book_collections = book.book_collections
    return_json = {'length': len(book_collections)}
    collection_json = []
    for i in range(len(book_collections)):
        collection_json.append({
            'book_collection_id': book_collections[i].book_collection_id,
            'collection_address': book_collections[i].collection_address,
            'campus': book_collections[i].campus,
            'statu': book_collections[i].statu
        })
    return_json['book_collections'] = collection_json
    return jsonify(return_json), 200

@book.route('/lendinfo/<int:book_collection_id>', methods=['GET'])
def get_lendinfo(book_collection_id):
    """
    获取某藏本的借阅记录信息接口
    :url /api/book/lendinfo/:book_collection_id 
    :method get
    :param book_collection_id 要获取借阅记录的藏本的id
    :return {'length', 'lendinfos':{
        'user', 'lend_time', 'expected_return_time', 'returned'
    }}
    length 借阅记录的数量
    lendinfos 借阅记录集
    user 借阅人姓名
    lend_time 借阅时间
    expected_return_time 预计归还时间
    returned 是否归还
    """
    lendinfos = db.session.query(LendingInfo).\
    filter_by(book_collection_id=book_collection_id).\
    order_by(LendingInfo.lend_time).limit(current_app.config['BOOK_LENDINFO_NUMS']).all()
    returned_json = {'length': len(lendinfos)}
    lendinfos_json = []
    for i in range(len(lendinfos)):
        lendinfos_json.append({
            'user': db.session.query(User.name).filter_by(user_id=lendinfos[i].user_id).first(),
            'lend_time': lendinfos[i].lend_time,
            'expected_return_time': lendinfos[i].expected_return_time,
            'returned': lendinfos[i].returned
        })
    returned_json['lendinfos'] = lendinfos_json
    return jsonify(returned_json), 200

@book.route('/notice/<int:book_id>', methods=['GET'])
def add_notice(book_id):
    new_notice = Notice(session['id'], book_id)
    db.session.add(new_notice)
    db.session.commit()
