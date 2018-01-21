import json
import unittest
from random import randint

from flask import current_app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .. import create_app
from ..models import Book, Classification
from ..utils.data_generator import MyDataGenerator


class TestBackendApi(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.app, cls.db = create_app('testing')
        cls.ctx = cls.app.app_context()
        cls.ctx.push()

    @classmethod
    def tearDownClass(cls):
        cls.ctx.pop()

    def setUp(self):
        TestBackendApi.db.create_all()
        self.app = TestBackendApi.app.test_client()
        self.engine = create_engine(current_app.config['SQLALCHEMY_DATABASE_URI'])
        self.Session = sessionmaker(bind=self.engine, autoflush=False)
        self.session = self.Session()

    def tearDown(self):
        TestBackendApi.db.drop_all()

    def write_data_to_db(self, data_size=None):
        mdg = MyDataGenerator()
        authors = mdg.generate_author(current_app.config['TESTING_DATA_SIZE'] * 2 
                                    if data_size is None else data_size * 2)
        publish_houses = mdg.generate_publish_house(data_size or current_app.config['TESTING_DATA_SIZE'])
        classifications = mdg.generate_classification(data_size or current_app.config['TESTING_DATA_SIZE'])
        books = mdg.generate_book(data_size or current_app.config['TESTING_DATA_SIZE'])

        engine = create_engine(current_app.config['SQLALCHEMY_DATABASE_URI'])
        Session = sessionmaker(bind=engine, autoflush=False)
        session = Session()

        for i in range(data_size or current_app.config['TESTING_DATA_SIZE']):
            one_book_s_authors = []
            random_num = randint(0,1)
            for j in range(random_num+1):
                one_book_s_authors.append(next(authors))
            publish_house = next(publish_houses)
            classification = next(classifications)

            # 这一段代码的作用是因为分类属性不能重复，而分类生成器又只会生成极少数量的几个分类，所以有很大
            # 的概率分类属性会重复。因此要在这加个判断，判断该分类是否已经存在于数据库中了，若已经存在了，
            # 则不在session中重复添加该分类。
            temp_classification = session.query(Classification).filter_by(name=classification.name).first()
            if temp_classification is not None:
                classification = temp_classification

            book = next(books)
            for j in range(random_num+1):
                book.authors.append(one_book_s_authors[j])
                session.add(one_book_s_authors[j])
            publish_house.books.append(book)
            classification.books.append(book)
            session.add(publish_house)
            if temp_classification is None:
                session.add(classification)
            session.add(book)
            session.commit()

    # def test_write_data_to_db(self):
    #     self.write_data_to_db()
    #     assert len(Book.query.all()) == current_app.config['TESTING_DATA_SIZE']

    def test_create_new_classification(self):
        response = self.app.post('/api/book/classification',
                                 data=json.dumps({'classification_name': '测试'}),
                                 content_type='application/json')
        assert '测试'.encode() in response.data

        response = self.app.post('/api/book/classification',
                                 data=json.dumps({'classification_name': '子测试',
                                                  'upper_classification_name': '测试'}),
                                 content_type='application/json')
        assert '测试'.encode() in response.data and '子测试'.encode() in response.data

    def test_create_new_book(self):
        self.app.post('/api/book/classification',
                      data=json.dumps({'classification_name': '测试'}),
                      content_type='application/json')

        book_dict = {'isbn': '978-7-307-05866-8', 'language': '中文', 'name': '数据库安全', 'authors': ['刘辉'],
                     'topic': '数据库', 'publish_house': '人民出版社', 'classification': '测试',
                     'publish_date': 2007, 'call_number': 'TP331.13-43'}
        response = self.app.post('/api/book/book', data=json.dumps(book_dict), content_type='application/json')
        assert '数据库安全'.encode() in response.data

    def test_get_book_by_id(self):
        self.write_data_to_db(1)
        book = self.session.query(Book).first()

        response = self.app.get('/api/book/' + str(book.book_id))
        assert book.name.encode() in response.data

        response = self.app.get('/api/book/950687')
        assert response.status_code == 404

        response = self.app.get('/api/book/jfah')
        assert response.status_code == 404

        response = self.app.post('/api/book/' + str(book.book_id))
        assert response.status_code == 405

    def test_get_book_by_isbn(self):
        self.write_data_to_db(1)
        book = self.session.query(Book).first()

        response = self.app.get('/api/book/isbn/' + book.isbn)
        assert book.name.encode() in response.data

        response = self.app.get('/api/book/isbn/950687')
        assert response.status_code == 404

        response = self.app.get('/api/book/isbn/jfah')
        assert response.status_code == 404

        response = self.app.post('/api/book/isbn/' + book.isbn)
        assert response.status_code == 405        
