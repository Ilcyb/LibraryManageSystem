import requests
from bs4 import BeautifulSoup
from app.utils.user_agent import MY_USER_AGENT
from random import randint
from json import dump, load, dumps, loads
from time import sleep, time
from app.models import Classification

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
