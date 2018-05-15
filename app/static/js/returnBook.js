function updateURLParameter(url, param, paramVal) {
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";
    if (additionalURL) {
        tempArray = additionalURL.split("&");
        for (i = 0; i < tempArray.length; i++) {
            if (tempArray[i].split('=')[0] != param) {
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    }

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}

function getUrlParam(name) {
    var url = new URL(window.location.href);
    var result = url.searchParams.get(name);
    return result;
}


function get_lend_infos() {
    var url = '/api/book/getLendingInfos';
    if (getUrlParam('page') == null)
        var page = 1;
    else
        var page = getUrlParam('page');
    url = updateURLParameter(url, 'page', page);
    if (getUrlParam('username') != null)
        url = updateURLParameter(url, 'username', getUrlParam('username'))
    if (getUrlParam('book_name') != null)
    url = updateURLParameter(url, 'book_name', getUrlParam('book_name'))
    var li_xhr = new XMLHttpRequest();
    li_xhr.open('GET', url);
    li_xhr.send();
    li_xhr.onreadystatechange = function () {
        if (li_xhr.readyState === 4) {
            if (li_xhr.status === 200) {
                var result = JSON.parse(li_xhr.responseText);
                var table = document.getElementsByClassName('book_table')[0];
                for (var i = 0; i < result['lending_infos'].length; i++) {
                    var new_tr = document.createElement('tr');
                    var id_td = document.createElement('td');
                    id_td.innerText = result['lending_infos'][i]['id'];
                    new_tr.appendChild(id_td);
                    var book_name_td = document.createElement('td');
                    book_name_td.innerText = result['lending_infos'][i]['book_name'];
                    new_tr.appendChild(book_name_td);
                    var isbn_td = document.createElement('td');
                    isbn_td.innerText = result['lending_infos'][i]['isbn'];
                    new_tr.appendChild(isbn_td);
                    var user_td = document.createElement('td');
                    user_td.innerText = result['lending_infos'][i]['username'];
                    new_tr.appendChild(user_td);
                    var lend_time_td = document.createElement('td');
                    lend_time_td.innerText = result['lending_infos'][i]['lend_time'];
                    new_tr.appendChild(lend_time_td);
                    var e_time_td = document.createElement('td');
                    e_time_td.innerText = result['lending_infos'][i]['expected_return_time'];
                    new_tr.appendChild(e_time_td);
                    var is_expiration = result['lending_infos'][i]['isExpiration'];
                    var days_td = document.createElement('td');
                    if (is_expiration) {
                        days_td.innerText = '超期 ' + result['lending_infos'][i]['days'] + ' 天';
                    } else {
                        days_td.innerText = '未超期';
                        days_td.style.color = '#000000';
                    }
                    new_tr.appendChild(days_td);
                    var r_b_td = document.createElement('td');
                    var r_btn = document.createElement('button');
                    r_btn.id = 'rbtn_' + result['lending_infos'][i]['id'];
                    r_btn.innerText = '还书';
                    r_btn.onclick = return_book;
                    var x_btn = document.createElement('button');
                    x_btn.id = 'xbtn_' + result['lending_infos'][i]['id'];
                    x_btn.innerText = '续借';
                    x_btn.onclick = renew_book;
                    r_b_td.appendChild(r_btn);
                    r_b_td.appendChild(x_btn);
                    new_tr.appendChild(r_b_td);
                    table.appendChild(new_tr);
                }
                set_page(result['length'], page);
            }
        }
    }
}

function search(){
    var book_name = document.getElementById('book_name').value;
    var username = document.getElementById('username').value;
    if(book_name.replace(/\s+/g, "").length == 0 && username.replace(/\s+/g, "").length == 0){
        alert('请至少填写一项搜索条件');
        return;
    }
    var url = '/admin/return';
    if(book_name.replace(/\s+/g, "").length != 0)
        url = updateURLParameter(url, 'book_name', book_name);
    if(username.replace(/\s+/g, "").length != 0)
    url = updateURLParameter(url, 'username', username);
    window.location.href = url;
}

function set_page(length, page) {
    var now_url = window.location.href;
    var left_num = document.getElementById('left_num');
    var right_num = document.getElementById('right_num');
    var left_page = document.getElementById('left_page');
    var right_page = document.getElementById('right_page');
    var max_page = Math.ceil(length / 10);
    left_num.innerText = page;
    right_num.innerText = max_page;
    if (page == 1) {
        left_page.href = updateURLParameter(now_url, 'page', 1);
        if (max_page > 1)
            right_page.href = updateURLParameter(now_url, 'page', parseInt(page) + 1);
        else
            right_page.href = updateURLParameter(now_url, 'page', 1)
    } else {
        left_page.href = updateURLParameter(now_url, 'page', parseInt(page) - 1);
        if (max_page > page)
            right_page.href = updateURLParameter(now_url, 'page', parseInt(page) + 1);
        else
            right_page.href = now_url;
    }
}

function jump_page() {
    var page = document.getElementById('jump_text').value;
    if (page.replace(/\s+/g, "").length == 0)
        return;
    if (!page.isNaN())
        return;
    var right_page = document.getElementById('right_page');
    max_page = getUrlParam('page');
    if (max_page == null)
        max_page = 1;
    if (page > max_page)
        return;
    window.location.href = updateURLParameter(window.location.href, 'page', page);
}

function return_book(){
    var event = window.event; //获取当前窗口事件 
    var obj = event.srcElement ? event.srcElement : event.target;
    var lending_info_id = obj.id.split('_')[1];
    var sure = confirm('确认归还图书吗？')
    if(!sure)
        return;
    var rb_xhr = new XMLHttpRequest();
    rb_xhr.open('POST', '/api/book/return');
    rb_xhr.setRequestHeader('Content-Type', 'application/json');
    rb_xhr.send(JSON.stringify({
        lending_info_id: lending_info_id
    }));
    rb_xhr.onreadystatechange = function(){
        if(rb_xhr.readyState === 4){
            if(rb_xhr.status === 201){
                alert('归还图书成功');
                window.location.reload();
            }else{
                alert(JSON.parse(rb_xhr.responseText)['reason']);
            }
        }
    }

}

function renew_book(){
    var event = window.event; //获取当前窗口事件 
    var obj = event.srcElement ? event.srcElement : event.target;
    var lending_info_id = obj.id.split('_')[1];
    var sure = confirm('确认续借图书吗？')
    if(!sure)
        return;
    var rb_xhr = new XMLHttpRequest();
    rb_xhr.open('GET', '/api/book/renew/' + lending_info_id);
    rb_xhr.send();
    rb_xhr.onreadystatechange = function(){
        if(rb_xhr.readyState === 4){
            if(rb_xhr.status === 200){
                alert('续借图书成功');
                window.location.reload();
            }else{
                alert(JSON.parse(rb_xhr.responseText)['reason']);
            }
        }
    }
}