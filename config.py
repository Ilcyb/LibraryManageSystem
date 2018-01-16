from os import environ


class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = '@#$TF)+}|dsfGF%$'


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://' + environ.get('local_mysql_username') + \
                              ':' + environ.get('mysql_password') + '@localhost/library_dev'


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://' + environ.get('local_mysql_username') + \
                              ':' + environ.get('mysql_password') + '@localhost/library_test'


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://' + environ.get('local_mysql_username') + \
                              ':' + environ.get('mysql_password') + '@localhost/library'


configs = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,

    'default': DevelopmentConfig
}
