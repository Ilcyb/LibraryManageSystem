from os import environ
from os.path import abspath, dirname, join


class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = '@#$TF)+}|dsfGF%$'
    # 默认情况下，Flask将对象序列化为ascii编码的JSON。如果设置为False Flask将不会编码为ASCII，并按原样输出字符串并返回unicode字符串。 jsonify将自动将其编码为utf-8，然后进行传输。
    JSON_AS_ASCII = False
    SQLALCHEMY_ECHO = False
    DEFAULT_SEARCH_RESULT_PER_PAGE = 10


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://' + environ.get('local_mysql_username') + \
                              ':' + environ.get('mysql_password') + '@localhost/library_dev?charset=utf8'


class TestingConfig(Config):
    TESTING = True
    FILEPATH = join(dirname(abspath(__file__)), 'test.db')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + FILEPATH
    # SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://' + environ.get('local_mysql_username') + \
    #                           ':' + environ.get('mysql_password') + '@localhost/library_test?charset=utf8'
    TESTING_DATA_SIZE = 30


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://' + environ.get('local_mysql_username') + \
                              ':' + environ.get('mysql_password') + '@localhost/library?charset=utf8'


configs = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,

    'default': DevelopmentConfig
}
