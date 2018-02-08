import random

from faker import Faker
from faker.providers import BaseProvider

from ..models import Author, Book, Classification, PublishHouse, User


class LibraryProvider(BaseProvider):
    def language(self):
        mylist = ['中文', '英文', '日语', '法语', '德语', '西班牙语', '韩语', '瑞典语']
        return mylist[random.randint(0, len(mylist) - 1)]

    def topic(self):
        mylist = ['历史', '人文', '数据库', '春秋', '战国', '音乐', '电影', '西班牙', '旅行']
        return mylist[random.randint(0, len(mylist) - 1)]

    def publish_house(self):
        return Faker('zh_CN').name() + '出版社'

    def classification(self):
        mylist = [
            '短篇小说', '长篇小说', '西方文学', '古典文学', '计算机科学', '医学', '生命科学', '马克思主义哲学',
            '数学'
        ]
        return mylist[random.randint(0, len(mylist) - 1)]


fake = Faker('zh_CN')
fake.add_provider(LibraryProvider)


class MyDataGenerator:
    
    def __init__(self, **kwargs):
        self.book_name = kwargs.get('book_name', None)
        self.author_name = kwargs.get('author_name', None)
        self.classification_name = kwargs.get('classification_name', None)
        self.publish_house = kwargs.get('publish_house', None)
        self.language = kwargs.get('language', None)
        self.topic = kwargs.get('topic', None)
        self.year = kwargs.get('year', None)

    def generate_author(self, n):
        for i in range(n):
            yield Author(fake.name() if self.author_name is None else fake.name() + self.author_name)

    def generate_publish_house(self, n):
        for i in range(n):
            yield PublishHouse(fake.publish_house() if self.publish_house is None
                             else fake.publish_house() + self.publish_house)

    def generate_classification(self, n):
        for i in range(n):
            yield Classification(fake.classification() if self.classification_name is None 
                                else fake.classification() + self.classification_name)

    def generate_book(self, n):
        for i in range(n):
            yield Book(fake.isbn13(), 
                        fake.language() if self.language is None else fake.language() + self.language, 
                        fake.name() if self.book_name is None else fake.name() + self.book_name, 
                        fake.topic() if self.topic is None else self.topic,
                        fake.year() if self.year is None else self.year, fake.ssn())

    def generate_user(self, n):
        for i in range(n):
            yield User(fake.name(), fake.password(), fake.email())

    def generate_other(self, attr, n):
        for i in range(n):
            yield getattr(fake, attr)()