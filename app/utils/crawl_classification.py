import requests
from bs4 import BeautifulSoup
from app.utils.user_agent import MY_USER_AGENT
from random import randint
from json import dump, load
from time import sleep

index_url = 'http://www.clcindex.com'

headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Referer': 'http://www.baidu.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
}

crawed_urls = ['http://www.baidu.com']

def fetch_classification(url, temp=[], upper=None):
    while True:
        try:
            sleep(randint(2,5))
            headers['User-Agent'] = MY_USER_AGENT[randint(0,len(MY_USER_AGENT) - 1)]
            headers['Referer'] = crawed_urls[randint(0,len(crawed_urls) - 1)]
            classification_index_page = requests.get(url, headers=headers)
            # proxies = {'http': 'http://139.199.228.34:7322'}
            classification_index_page.raise_for_status()
        except requests.exceptions.HTTPError:
            pass
        else:
            crawed_urls.append(url)
            break
    try:
        index_doc = BeautifulSoup(classification_index_page.text, 'html.parser')
        table = index_doc.find(id='catTable')
        tr_list = table.find_all(attrs={'name':'item-row'})
        the_turn_dict = dict()
        if len(tr_list) == 0:
            return {}
        for tr in tr_list:
            td_list = tr.find_all('td')
            classifiction_name = td_list[1].string.strip() + '.' + td_list[2].string.strip()
            print('父亲:', upper if upper is not None else '无' ,classifiction_name)
            sub_url = index_url + td_list[2].a['href']
            temp.append([upper, classifiction_name])
            fetch_classification(sub_url, temp, classifiction_name)
        return temp
    except Exception as e:
        print(e)
        return

if __name__ == '__main__':
    result = fetch_classification(index_url)
    f = open('classifications.json', 'w', encoding='utf-8')
    dump(result, f)