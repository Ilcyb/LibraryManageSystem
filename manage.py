from app import create_app, db
from app.models import PublishHouse
from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand

app = create_app('default')
manager = Manager(app)
migrate = Migrate(app, db)

manager.add_command('db', MigrateCommand)

@manager.shell
def make_shell_context():
    return dict(app=app, db=db, PublishHouse=PublishHouse)


@manager.command
def re_create_db():
    db.drop_all()
    db.create_all()


@manager.command
def deploy():
    from app.models import Role, Level
    from flask_migrate import upgrade

    upgrade()

    Role.insert_roles()

    Level.insert_levels()



if __name__ == '__main__':
    manager.run()
