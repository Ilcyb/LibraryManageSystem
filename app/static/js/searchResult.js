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
                    window.location.href = result.page;
                }
            }
        }
    }
}

function book_search() {
    var search_input = document.getElementById('input_top');
    var drop_list = document.getElementById('sel_top');
    var drop_list_index = drop_list.selectedIndex;
    switch (drop_list_index) {
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

function search_req() {
    var params = window.location.href.split('?')[1];
    var search_type = params.split('&')[0].split('=')[1];
    var search_keyword = params.split('&')[1].split('=')[1];
    var search_xhr = new XMLHttpRequest();
    var url = '';
    switch (search_type) {
        case 'allField':
            url = '/api/book/searchAllField/' + search_keyword;
            break;
        case 'bookName':
            url = '/api/book/searchByBookName/' + search_keyword;
            break;
        case 'author':
            url = '/api/book/searchByAuthor/' + search_keyword;
            break;
        case 'publishHouse':
            url = '/api/book/searchByPublishHouse/' + search_keyword;
            break;
        case 'isbn':
            window.location.href = '/book/isbn/' + search_keyword;
            break;
        case 'topic':
            url = '/api/book/searchByTopic/' + search_keyword;
            break;
    }
    var perpage = document.getElementById('show_news')[document.getElementById('show_news').selectedIndex].value;
    if(getUrlParam('perpage') != null)
        perpage = getUrlParam('perpage');
    var sortfield = document.getElementById('banner_sort')[document.getElementById('banner_sort').selectedIndex].value;
    if(getUrlParam('sortfield') != null)
    sortfield = getUrlParam('sortfield');
    var page = 1;
    if(getUrlParam('page') != null)
        page = getUrlParam('page');
    var url = url + '?perpage=' + perpage + '&sortfield=' + sortfield + '&page=' +page;
    search_xhr.open('GET', url);
    search_xhr.send();
    search_xhr.onreadystatechange = function () {
        if (search_xhr.readyState === 4) {
            if (search_xhr.status === 200) {
                if (search_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    // 动态填写查询的关键字和结果数量7
                    result = JSON.parse(search_xhr.responseText);
                    var search_input = document.getElementById('input_top');
                    search_input.value = result['keyword'];
                    var keyword_a = document.getElementById('a_search_keyword');
                    keyword_a.innerHTML = '&nbsp;&nbsp;' + result['keyword'] + '&nbsp;&nbsp;';
                    var length_a = document.getElementById('a_search_length');
                    length_a.innerHTML = '&nbsp;&nbsp;' + result['length'] + '&nbsp;&nbsp;';
                    // 动态生成图书详情列表
                    for (var i = 0; i < result['books'].length; i++) {
                        var total_list = document.getElementById('search_total_list');
                        // search_total_list_li
                        var list_li = document.createElement('li');
                        list_li.className = 'search_total_list_li';
                        total_list.appendChild(list_li);
                        // book_img
                        var book_img_div = document.createElement('div');
                        book_img_div.className = 'book_img';
                        var book_img = document.createElement('img');
                        book_img.src = result['books'][i]['image'];
                        book_img_div.appendChild(book_img);
                        list_li.appendChild(book_img_div);
                        //result_list_banner
                        var div_rlb = document.createElement('div');
                        div_rlb.className = 'result_list_banner';
                        list_li.appendChild(div_rlb);
                        // result_list_small
                        var ul_rls = document.createElement('ul');
                        ul_rls.id = 'result_list_small';
                        div_rlb.appendChild(ul_rls);
                        // li_book_name
                        var li_bn = document.createElement('li');
                        li_bn.className = 'li_book_name';
                        ul_rls.appendChild(li_bn);
                        var a_bn = document.createElement('a');
                        a_bn.href = '/book/' + result['books'][i]['id'];
                        a_bn.innerText = result['books'][i]['name'];
                        li_bn.appendChild(a_bn);
                        // li_book_author
                        var li_au = document.createElement('li');
                        li_au.className = 'li_book_author';
                        li_au.innerHTML = result['books'][i]['authors'].join(',') + '著';
                        ul_rls.appendChild(li_au);
                        // li_book_num
                        var li_bnum = document.createElement('li');
                        li_bnum.className = 'li_book_num';
                        li_bnum.innerHTML = '索书号： ' + result['books'][i]['call_number'];
                        ul_rls.appendChild(li_bnum);
                        // li_book_isbn
                        var li_isbn = document.createElement('li');
                        li_isbn.className = 'li_book_isbn';
                        li_isbn.innerHTML = '标准编码：' + result['books'][i]['isbn'];
                        ul_rls.appendChild(li_isbn);
                        // li_book_publish
                        var li_pbl = document.createElement('li');
                        li_pbl.className = 'li_book_publish';
                        li_pbl.innerHTML = '出版信息：' + result['books'][i]['publish_house'] +
                            ' ' + result['books'][i]['publish_date'];
                        ul_rls.appendChild(li_pbl);
                        // collects_num
                        var li_cn = document.createElement('li');
                        li_cn.className = 'collects_num';
                        li_cn.innerHTML = '馆藏数量：' + result['books'][i]['book_collections_nums'];
                        ul_rls.appendChild(li_cn);
                        // borrow_num
                        var li_brn = document.createElement('li');
                        li_brn.className = 'borrow_num';
                        li_brn.innerHTML = '可外借数量：' + result['books'][i]['borrowable_collections_nums'];
                        ul_rls.appendChild(li_brn);
                        // li_book_show
                        var li_bs = document.createElement('li');
                        li_bs.className = 'li_book_show';
                        ul_rls.appendChild(li_bs);
                        var a_s = document.createElement('a');
                        a_s.id = 'a_show_' + result['books'][i]['id'];
                        a_s.innerHTML = '馆藏预览';
                        a_s.addEventListener('mouseover', function (event) {
                            show_preview(event.target);
                        }, false);
                        li_bs.appendChild(a_s);
                        // 分页的链接生成
                        page = parseInt(page);
                        var first_page = 1;
                        if (page === 1)
                            var pre_page = 1;
                        else
                            var pre_page = page - 1;
                        var last_page = Math.ceil(result['length'] / perpage);
                        if (page === last_page)
                            var next_page = page;
                        else
                            var next_page = page + 1;
                        var page_list = document.getElementsByClassName('page_list')[0];
                        var a_list = page_list.getElementsByTagName('a');
                        a_list[0].href = updateURLParameter(window.location.href, 'page', first_page);
                        a_list[1].href = updateURLParameter(window.location.href, 'page', pre_page);
                        a_list[2].href = updateURLParameter(window.location.href, 'page', next_page);
                        a_list[3].href = updateURLParameter(window.location.href, 'page', last_page);
                    }
                }
            }
        }
    }
}

function change_perpage() {
    var perpage = document.getElementById('show_news')[document.getElementById('show_news').selectedIndex].value;
    var url = window.location.href;
    var route_url = url.split('?')[0];
    var params_url = url.split('?')[1];
    var params_list = params_url.split('&');
    var temp_params_list = [];
    var temp_params_url = '';
    var perpage_flag = false;
    for (var i = 0; i < params_list.length; i++) {
        var temp_list = params_list[i].split('=');
        if (params_list[i].indexOf('perpage') >= 0) {
            temp_list[1] = perpage;
            perpage_flag = true;
        }
        temp_params_list.push(temp_list.join('='));
    }
    if (perpage_flag === false)
        temp_params_list.push(['perpage', perpage].join('='));
    temp_params_url = temp_params_list.join('&');
    window.location.href = route_url + '?' + temp_params_url;
}

function change_sortfield() {
    var sortfield =
        document.getElementById('banner_sort')[document.getElementById('banner_sort').selectedIndex].value;
    var url = window.location.href;
    var route_url = url.split('?')[0];
    var params_url = url.split('?')[1];
    var params_list = params_url.split('&');
    var temp_params_list = [];
    var temp_params_url = '';
    var sortfield_flag = false;
    for (var i = 0; i < params_list.length; i++) {
        var temp_list = params_list[i].split('=');
        if (params_list[i].indexOf('sortfield') >= 0) {
            temp_list[1] = sortfield;
            sortfield_flag = true;
        }
        temp_params_list.push(temp_list.join('='));
    }
    if (sortfield_flag === false)
        temp_params_list.push(['sortfield', sortfield].join('='));
    temp_params_url = temp_params_list.join('&');
    window.location.href = route_url + '?' + temp_params_url;
}

function show_preview(target) {
    book_id = target.getAttribute('id').split('_')[2];
    var sp_xhr = new XMLHttpRequest();
    sp_xhr.open('GET', '/api/book/book_collections/' + book_id);
    sp_xhr.send();
    sp_xhr.onreadystatechange = function () {
        if (sp_xhr.readyState === 4) {
            if (sp_xhr.status === 200) {
                if (sp_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    var result = JSON.parse(sp_xhr.responseText);
                    var li_bs = target.parentNode;
                    // collects_show
                    var table_cs = document.createElement('table');
                    table_cs.className = 'collects_show';
                    li_bs.appendChild(table_cs);
                    var h_tr = document.createElement('tr');
                    h_tr.innerHTML = '<th>索书号</th><th>所属校区</th><th>馆藏地址</th><th>书刊状态</th>';
                    table_cs.appendChild(h_tr);
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
                    li_bs.addEventListener('mouseout', function (event) {
                        remove_preview(event.target);
                    }, false);
                }
            }
        }
    }
}

function remove_preview(target) {
    var li_bs = target.parentNode;
    var table = li_bs.getElementsByTagName('table')[0];
    li_bs.removeChild(table);
}