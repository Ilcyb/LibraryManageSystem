import json
import unittest

from flask import current_app, session, url_for

from .. import create_app, db
from ..models import User, Role, Permission
from ..utils.data_generator import MyDataGenerator


class TestAuthApi(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.app = create_app('testing')[0]
        cls.ctx = cls.app.app_context()
        cls.ctx.push()

    @classmethod
    def tearDownClass(cls):
        cls.ctx.pop()

    def setUp(self):
        db.create_all()
        self.app = TestAuthApi.app.test_client()
        Role.insert_roles()

    def tearDown(self):
        db.drop_all()

    def write_user_to_db(self, data_size=None, username=None, password=None, email=None):
        Role.insert_roles()
        mdg = MyDataGenerator()

        if username and password:
            user = User(username, password, email)
            db.session.add(user)
        else:
            users = mdg.generate_user(data_size or current_app.config['TESTING_DATA_SIZE'])
            for i in range(data_size or current_app.config['TESTING_DATA_SIZE']):
                user = next(users)
                db.session.add(user)
        db.session.commit()

    # def test_write_user_to_db(self):
    #     self.write_user_to_db(data_size=5)
    #     assert len(User.query.all()) == 5

    def test_register_api(self):
        self.app.post('/api/user/register',
                      data=json.dumps({'username': 'username1',
                                       'password': 'password1',
                                       'email': 'email@test1'}),
                      content_type='application/json')
        user_list = db.session.query(User).all()
        assert len(user_list) == 1 and user_list[0].username == 'username1'

        response = self.app.post('/api/user/register',
                                 data=json.dumps({'username': 'username1',
                                                  'password': 'password1',
                                                  'email': 'email@test1'}),
                                 content_type='application/json')
        assert '此用户名已被注册'.encode() in response.data

        response = self.app.post('/api/user/register',
                                 data=json.dumps({'username': '',
                                                  'password': 'password1',
                                                  'email': 'email@test1'}),
                                 content_type='application/json')
        assert response.status_code == 403

        self.app.post('/api/user/register',
                      data=json.dumps({'username': 'username2',
                                       'password': 'password2',
                                       'email': 'email@test2'}),
                      content_type='application/json')
        user_list = db.session.query(User).all()
        assert len(user_list) == 2 and user_list[1].username == 'username2'

    def test_login_api(self):
        self.write_user_to_db(username='username1', password='password1', email='test@test.com')

        response = self.app.post('/api/user/login',
                                 data=json.dumps({'password': 'password1'}),
                                 content_type='application/json')
        assert response.status_code == 403

        response = self.app.post('/api/user/login',
                                 data=json.dumps({'username': 'username1',
                                                  'password': 'wrongpassword'}),
                                 content_type='application/json')
        assert '用户名或密码错误'.encode() in response.data

        with TestAuthApi.app.test_client() as c:
            response = c.post('/api/user/login',
                                    data=json.dumps({'username': 'username1',
                                                    'password': 'password1'}),
                                    content_type='application/json')
            assert session['login'] == True and session['username'] == 'username1' \
                    and url_for('main.index').encode() in response.data

    def test_is_login(self):
        self.write_user_to_db(username='testuser', password='testpwd', email='test@test.com')
        with TestAuthApi.app.test_client() as c:
            response = c.get('/api/user/isLogin')
            assert '"is_login": false'.encode() in response.data

            c.post('/api/user/login',
                            data=json.dumps({'username': 'testuser',
                                            'password': 'testpwd'}),
                            content_type='application/json')
            response = c.get('/api/user/isLogin')
            assert '"is_login": true'.encode() in response.data \
            and '"username": "testuser"'.encode() in response.data

            with c.session_transaction() as sess:
                sess['username'] = None
            response = c.get('/api/user/isLogin')
            assert '"is_login": false'.encode() in response.data and response.status_code == 403

    def test_logout(self):
        self.write_user_to_db(username='testuser', password='testpwd', email='test@test.com')
        with TestAuthApi.app.test_client() as c:
            c.post('/api/user/login',
                            data=json.dumps({'username': 'testuser',
                                            'password': 'testpwd'}),
                            content_type='application/json')
            response = c.get('/api/user/isLogin')
            assert '"is_login": true'.encode() in response.data \
            and '"username": "testuser"'.encode() in response.data

            c.get('/api/user/logout')
            response = c.get('/api/user/isLogin')
            assert '"is_login": false'.encode() in response.data
