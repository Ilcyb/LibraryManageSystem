from app import create_app, db
from app.models import PublishHouse, User, Book, BookCollection
from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand

app = create_app('default')
manager = Manager(app)
migrate = Migrate(app, db)

manager.add_command('db', MigrateCommand)

@manager.shell
def make_shell_context():
    return dict(app=app, db=db, PublishHouse=PublishHouse, User=User, Book=Book, BookCollection=BookCollection)


@manager.command
def re_create_db():
    db.drop_all()
    db.create_all()


@manager.command
def fill_classification():
    from app.utils.crawl_classification import crawl_classification
    crawl_classification(db)
    print('填充图书类别数据库成功')


@manager.command
def deploy():
    from app.models import Role, Level
    from flask_migrate import upgrade

    upgrade()

    Role.insert_roles()

    Level.insert_levels()



if __name__ == '__main__':
    manager.run()
