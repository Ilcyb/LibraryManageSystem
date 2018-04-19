import requests
from bs4 import BeautifulSoup
from app.utils.user_agent import MY_USER_AGENT
from random import randint, sample, random
from json import dump, load, dumps, loads
from time import sleep, time
from app.models import Classification, Book, Author, PublishHouse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flask import current_app

index_url = r'http://202.203.181.42:9090/opac/getClassNumberTree'

headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Referer': 'http://www.baidu.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
}

crawed_urls = ['http://www.baidu.com']

def crawl_classification(db, id=1, name='中国分类', upper=None, otherParam='zTreeAsyncTest', timestamp=int(round(time() * 1000))):
    r = requests.get(index_url, params={'id':id, 'n':name, 'otherParam':otherParam, '_': timestamp} ,headers=headers)
    c_dict = loads(loads(r.text))
    for c in c_dict:
        if c['pId'] == 1:
            frist_alpha = c['name'][:2]
            c['name'] = c['name'][2:].strip(r'<B>/')
            c['name'] = frist_alpha + c['name']
        if c['isParent']:
            save_to_db(db, c['name'], upper)
            crawl_classification(db, id=c['id'], name=c['name'], upper=c['name'])
        else:
            save_to_db(db, c['name'], upper)

def save_to_db(db, classification_name, upper=None):
    new_classification = Classification(classification_name)
    db.session.add(new_classification)
    if upper is not None:
        upper_classification = db.session.query(Classification).filter_by(name=upper).first()
        upper_classification.sub_layers.append(new_classification)
    db.session.commit()

douban_top_250_url = 'https://book.douban.com/top250'
douban_book_api = 'https://api.douban.com/v2/book/'

def crawl_douban_top_250(db, count=250, url=douban_top_250_url):
    if count > 250:
        count = 250
    perpage = 25
    nums = 0
    classifications_id = [c[0] for c in db.session.query(Classification.classification_id).all()]

    engine = create_engine(current_app.config['SQLALCHEMY_DATABASE_URI'])
    Session = sessionmaker(bind=engine, autoflush=False)
    session = Session()

    for i in range(int(250/perpage)):
        response = requests.get(url, params={'start':i*perpage})
        doc = BeautifulSoup(response.text, 'html.parser')
        books_id = [div.find('a').get('href').split('/')[4] for div in doc.find_all(class_='pl2')]
        for book_id in books_id:
            sleep(5*random())
            api_url = douban_book_api + book_id
            book_dict = loads(requests.get(api_url).text)
            if 'limit' in book_dict.get('msg', ''):
                print('爬取速度过快，豆瓣已阻止爬取，请过五分钟再试')
                return False
            if save_book_to_db(session, book_dict, classifications_id[randint(0, len(classifications_id)-1)]):
                print('爬取进度', nums, '/', count)
                nums += 1
                if(nums == count):
                    return
        return True


def save_book_to_db(session, book_dict, classification_id):
    try:
        isbn = book_dict.get('isbn13', None)
        language = ['中文', '外文'][randint(0, 1)]
        name = book_dict.get('title', None)
        authors = book_dict.get('author', None)
        topic = book_dict.get('tags')[0]['name']
        publish_house_name = book_dict.get('publisher', None)
        publish_date = book_dict.get('pubdate', None).split('-')[0]
        call_number = 'CN' + isbn[3:]
        image = book_dict.get('image', None)

        if not (isbn and language and name and authors and topic and publish_house_name and \
                classification_id and publish_date and call_number):
            return False

        same_isbn = session.query(Book).filter_by(isbn=isbn).first()
        if same_isbn is not None:
            return False

        classification = session.query(Classification).filter_by(
            classification_id=classification_id).first()
        if not classification:
            return False

        publish_house = session.query(PublishHouse).filter_by(
            name=publish_house_name).first()
        if not publish_house:
            publish_house = PublishHouse(publish_house_name)
            session.add(publish_house)

        new_book = Book(isbn, language, name, topic, publish_date, call_number) if image is None else \
            Book(isbn, language, name, topic, publish_date, call_number, image)

        for author_name in authors:
            author = session.query(Author).filter_by(name=author_name).first()
            if not author:
                new_author = Author(author_name)
                session.add(new_author)
                new_book.authors.append(new_author)
            else:
                new_book.authors.append(author)

        classification.books.append(new_book)
        publish_house.books.append(new_book)
        session.add(new_book)
        session.commit()
    except Exception as e:
        session.rollback()
        print(e)
        return False
    else:
        return True
