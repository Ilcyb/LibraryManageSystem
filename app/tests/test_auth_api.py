import json
import unittest

from flask import current_app

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

    def tearDown(self):
        db.drop_all()

    def write_user_to_db(self, data_size=None):
        Role.insert_roles()
        mdg = MyDataGenerator()
        users = mdg.generate_user(data_size or current_app.config['TESTING_DATA_SIZE'])

        for i in range(data_size or current_app.config['TESTING_DATA_SIZE']):
            user = next(users)
            db.session.add(user)
        db.session.commit()

    def test_write_user_to_db(self):
        self.write_user_to_db(data_size=5)
        assert len(User.query.all()) == 5

    def test_login_api(self):
        pass
