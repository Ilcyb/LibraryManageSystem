function isLogin() {
    var isLogin_xhr = new XMLHttpRequest();
    isLogin_xhr.open('GET', '/api/user/isLogin');
    isLogin_xhr.send();
    isLogin_xhr.onreadystatechange = function () {
        var DONE = 4;
        var OK = 200;
        if (isLogin_xhr.readyState === DONE) {
            if (isLogin_xhr.status === OK) {
                if (isLogin_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    result = JSON.parse(isLogin_xhr.responseText);
                    if (result.is_login === true) {
                        var right_div = document.getElementsByClassName('right')[0].getElementsByTagName('a');
                        right_div[0].innerText = '[ ' + result.username + ' ]';
                        right_div[0].href = result.url;
                        right_div[1].innerText = '[ 注销 ]';
                        right_div[1].href = result.logout_url;
                        right_div[1].onclick = logout;
                    }
                }
            }
        }
    }
}

function logout() {
    var logout_xhr = new XMLHttpRequest();
    logout_xhr.open('GET', '/api/user/logout');
    logout_xhr.send();
    logout_xhr.onreadystatechange = function () {
        if (logout_xhr.readyState == 4) {
            if (logout_xhr.status == 200) {
                if (logout_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    result = JSON.parse(logout_xhr.responseText);
                    window.location.href = result.page;//浏览器加载一个新页面
                }
            }
        }
    }
}

function getAnnouncements() {
    var ann_xhr = new XMLHttpRequest();
    ann_xhr.open('GET', '/api/user/getAnnouncement');
    ann_xhr.send()
    ann_xhr.onreadystatechange = function () {
        if (ann_xhr.readyState == 4) {
            if (ann_xhr.status == 200) {
                if (ann_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    result = JSON.parse(ann_xhr.responseText);
                    var notice_list_ul =
                        document.getElementsByClassName('notice_list')[0].getElementsByTagName('ul')[0];
                    for (var i = 0; i < result.length; i++) {
                        var sub_li = document.createElement('li');
                        var sub_a = document.createElement('a');
                        sub_a.href = result.announcements[i].url;
                        sub_a.innerText = result.announcements[i].title;
                        sub_li.appendChild(sub_a);
                        notice_list_ul.appendChild(sub_li);
                    }

                }
            }
        }
    }
}

function book_search(){
    var search_input = document.getElementById('inp');
    var drop_list = document.getElementById('sel');
    var drop_list_index = drop_list.selectedIndex;
    switch(drop_list_index){
        case 0:
        window.location.href = '/searchResult?type=allField&keyword=' + search_input.value;
        break;
        case 1:
        window.location.href = '/searchResult?type=bookName&keyword=' + search_input.value;
        break;
        case 2:
        window.location.href = '/searchResult?type=author&keyword=' + search_input.value;
        break;
        case 3:
        window.location.href = '/searchResult?type=publishHouse&keyword=' + search_input.value;
        break;
        case 4:
        window.location.href = '/searchResult?type=isbn&keyword=' + search_input.value;
        break;
        case 5:
        window.location.href = '/searchResult?type=topic&keyword=' + search_input.value;
        break;
    }
}