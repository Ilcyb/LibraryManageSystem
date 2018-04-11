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

function get_book(){
    book_id = window.location.href.split('/').pop();
    var book_xhr = new XMLHttpRequest();
    book_xhr.open('GET', '/api/book/' + book_id);
    book_xhr.send();
    book_xhr.onreadystatechange = function(){
        if(book_xhr.readyState === 4){
            if(book_xhr.status === 200){
                result = JSON.parse(book_xhr.responseText);
                document.getElementById('book_name').innerText = result['book']['name'];
                document.getElementById('s_book_author').innerText = result['book']['authors'][0];
                document.getElementById('s_book_topic').innerText = result['book']['topic'];
                document.getElementById('same_author').href = '/searchResult?type=author&keyword=' + result['book']['authors'][0];
                document.getElementById('same_topic').href = '/searchResult?type=topic&keyword=' + result['book']['topic'];
                document.getElementById('book_img').src = result['book']['image'];
                fill_borrow_info(book_id);
                get_comments();
                var authors_name = result['book']['authors'].join(', ');
                document.getElementById('book_authors').innerText = authors_name;
                document.getElementById('book_isbn').innerText = result['book']['isbn'];
                document.getElementsByClassName('li_book_publish')[0].innerText =
                 '出版社： ' + result['book']['publish_house'] + ' ' + result['book']['publish_date'];
                 show_collections(book_id);
                var summary = document.getElementById('book_summary');
                var douban_summary_xhr = new XMLHttpRequest();
                douban_summary_xhr.open('GET', '/api/book/getBookDoubanInfo/' + result['book']['isbn']);
                douban_summary_xhr.send();
                douban_summary_xhr.onreadystatechange = function(){
                    if(douban_summary_xhr.readyState === 4){
                        if(douban_summary_xhr.status === 200){
                            summary.innerText = JSON.parse(douban_summary_xhr.responseText)['summary'];
                        }else if(douban_summary_xhr.status === 404){
                            summary.innerText = '此书籍暂时没有介绍';
                        }else if(douban_summary_xhr.status === 500){
                            summary.innerText = '服务器发生错误，请联系管理员';
                        }
                    }
                }
            }
        }
    }
}

function fill_borrow_info(book_id){
    var borrow_xhr = new XMLHttpRequest();
    borrow_xhr.open('GET', '/api/book/getBookBorrowInfo/' + book_id);
    borrow_xhr.send();
    borrow_xhr.onreadystatechange = function(){
        if(borrow_xhr.readyState === 4){
            if(borrow_xhr.status === 200){
                result = JSON.parse(borrow_xhr.responseText);
                var b_table = document.getElementsByClassName('borrow_notice')[0];
                for(var i=0;i<result['length'];i++){
                    var c_tr = document.createElement('tr');
                    var user_th = document.createElement('th');
                    var time_th = document.createElement('th');
                    user_th.innerText = result['lendinfos'][i]['username'];
                    time_th.innerText = result['lendinfos'][i]['expected_return_time'];
                    c_tr.appendChild(user_th);
                    c_tr.appendChild(time_th);
                    b_table.appendChild(c_tr);
                }
            }
        }
    }
}

function get_comments(){
    var comment_xhr = new XMLHttpRequest();
    book_id = window.location.href.split('/').pop();
    comment_xhr.open('GET', '/api/book/comments/' + book_id);
    comment_xhr.send();
    comment_xhr.onreadystatechange = function(){
        if(comment_xhr.readyState === 4){
            if(comment_xhr.status === 200){
                result = JSON.parse(comment_xhr.responseText);
                var comments_div = document.getElementsByClassName('book_comment')[0];
                for(var i=0;i<result['length'];i++){
                    var comment_user = document.createElement('h5');
                    comment_user.id = 'current_user';
                    comment_user.innerText = result['comment_infos'][i]['username'][0];
                    comment_content_p = document.createElement('p');
                    comment_content_p.id = 'current_comment';
                    comment_content_p.innerText = result['comment_infos'][i]['content'];
                    comments_div.appendChild(comment_user);
                    comments_div.appendChild(comment_content_p);
                }
            }
        }
    }
}

function submit_comment(){
    var comment_content = document.getElementById('write_comment').value;
    if(comment_content.replace(/\s+/g,"").length == 0)
        {
            alert('评论不能为空')
            return;
        }
    var isLogin_xhr = new XMLHttpRequest();
    isLogin_xhr.open('GET', '/api/user/isLogin');
    isLogin_xhr.send();
    isLogin_xhr.onreadystatechange = function () {
        var DONE = 4;
        var OK = 200;
        if (isLogin_xhr.readyState === DONE) {
            if (isLogin_xhr.status === OK) {
                if (isLogin_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    if(JSON.parse(isLogin_xhr.responseText).is_login){
                        var comment_xhr = new XMLHttpRequest();
                        comment_xhr.open('POST', '/api/user/new_comment');
                        book_id = window.location.href.split('/').pop();
                        comment_xhr.setRequestHeader('Content-Type', 'application/json');
                        comment_xhr.send(JSON.stringify({
                            book_id: book_id,
                            comment_content: comment_content
                        }));
                        comment_xhr.onreadystatechange = function(){
                            if(comment_xhr.readyState === DONE){
                                if(comment_xhr.status === OK){
                                    alert('评论成功');
                                    window.location.href = window.location.href;
                                }else{
                                    alert('出现未知错误，请联系管理员');
                                }
                            }
                        }
                    }else{
                        window.location.href = '/login';
                    }
                }
            }
        }
    }  
}

function show_collections(book_id) {
    var sp_xhr = new XMLHttpRequest();
    sp_xhr.open('GET', '/api/book/book_collections/' + book_id);
    sp_xhr.send();
    sp_xhr.onreadystatechange = function () {
        if (sp_xhr.readyState === 4) {
            if (sp_xhr.status === 200) {
                if (sp_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    var result = JSON.parse(sp_xhr.responseText);
                    var table_cs = document.getElementById('collections_table');
                    for (var i = 0; i < result['length']; i++) {
                        var d_tr = document.createElement('tr');
                        var cn_td = document.createElement('td');
                        cn_td.innerHTML = result['book_collections'][i]['call_number'];
                        var ca_td = document.createElement('td');
                        ca_td.innerHTML = result['book_collections'][i]['collection_address'];
                        var cp_td = document.createElement('td');
                        cp_td.innerHTML = result['book_collections'][i]['campus'];
                        var st_td = document.createElement('td');
                        if (result['book_collections'][i]['statu'])
                            st_td.innerHTML = '在藏';
                        else
                            st_td.innerHTML = '借出';
                        d_tr.appendChild(cn_td);
                        d_tr.appendChild(ca_td);
                        d_tr.appendChild(cp_td);
                        d_tr.appendChild(st_td);
                        table_cs.appendChild(d_tr);
                    }
                }
            }
        }
    }
}