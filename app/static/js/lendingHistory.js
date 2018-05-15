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
    var url = '/api/book/getAllLendingInfos';
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
                    if(result['lending_infos'][i]['returned'])
                        e_time_td.innerText = result['lending_infos'][i]['returned_time'];
                    else
                        e_time_td.innerText = '尚未归还';
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
                    var statu_td = document.createElement('td');
                    if(result['lending_infos'][i]['returned'])
                        statu_td.innerText = '已归还';
                    else
                        statu_td.innerText = '未归还';
                    new_tr.appendChild(statu_td);
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
    var url = '/admin/lendingHistory';
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
    if (page < 1)
        return;
    var right_page = document.getElementById('right_num').innerText;
    if (page > right_page)
        return;
    window.location.href = updateURLParameter(window.location.href, 'page', page);
}