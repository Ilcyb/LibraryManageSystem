function load_books() {
    var b_xhr = new XMLHttpRequest();
    var page = window.location.href.split('/')[window.location.href.split('/').length - 1];
    b_xhr.open('GET', '/api/book/getBooks/' + page);
    b_xhr.send();
    b_xhr.onreadystatechange = function () {
        if (b_xhr.readyState == 4) {
            if (b_xhr.status === 200) {
                if (b_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    result = JSON.parse(b_xhr.responseText);
                    var b_table = document.getElementsByClassName('book_table')[0];
                    var table_body = b_table.getElementsByTagName('tbody')[0];
                    for (var i = 0; i < result['books'].length; i++) {
                        var b_tr = document.createElement('tr');
                        var id_td = document.createElement('td');
                        id_td.id = 'book_id_td';
                        var n_td = document.createElement('td');
                        var i_td = document.createElement('td');
                        id_td.innerText = result['books'][i]['book_id'];
                        n_td.innerText = result['books'][i]['name'];
                        i_td.innerText = result['books'][i]['isbn'];
                        b_tr.appendChild(id_td);
                        b_tr.appendChild(n_td);
                        b_tr.appendChild(i_td);
                        var bc_ed_td = document.createElement('td');
                        bc_ed_td.innerHTML =
                            "<span class=\"collection_edit\" onclick=add_book_collection()>添加</span>" +
                            "<span class=\"collection_delete\">" +
                            "<a href=\"{{url_for('admin.create_new_book_collection')}}\">" +
                            "管理</a></span>";
                        var b_ed_td = document.createElement('td');
                        b_ed_td.innerHTML = "<span class=\"edit\">编辑</span><span class=\"delete\">删除</span>";
                        b_tr.appendChild(bc_ed_td);
                        b_tr.appendChild(b_ed_td);
                        table_body.appendChild(b_tr);
                    }
                    add_change_page_href(page, result['length']);
                }
            }
        }
    }
}

function add_change_page_href(page, length) {
    var max_page = Math.ceil(length / 10);
    var left_num = document.getElementById('left_num');
    var right_num = document.getElementById('right_num');
    var left_page = document.getElementById('left_page');
    var right_page = document.getElementById('right_page');
    left_num.innerText = page;
    right_num.innerText = max_page;
    current_url = window.location.href;
    current_page_index = current_url.lastIndexOf('/');
    current_url = current_url.substr(0, current_page_index + 1);
    if (page == 1)
        left_page.href = current_url + '1';
    else
        left_page.href = current_url + (page - 1);
    if (page == max_page)
        right_page.href = current_url + max_page;
    else
        right_page.href = current_url + (page + 1);
}

function jump_page() {
    var jump_page = document.getElementById('jump_text').value;
    current_url = window.location.href;
    current_page_index = current_url.lastIndexOf('/');
    current_url = current_url.substr(0, current_page_index + 1);
    window.location.href = current_url + jump_page;
}

function add_book_collection() {
    var event = window.event; //获取当前窗口事件 
    var obj = event.srcElement ? event.srcElement : event.target;
    var book_id = obj.parentNode.parentNode.firstChild.innerText;
    var hidden_div = document.getElementsByClassName('hidden')[0];
    hidden_div.style.display = 'block';
    var submit = document.getElementById('submit_hidden');
    submit.setAttribute('book_id', book_id);
    submit.onclick = function () {
        var collection_address = document.getElementById('addr');
        var campus = document.getElementById('campus');
        if (collection_address.value.length == 0) {
            alert('馆藏地址不能为空');
            return;
        }
        if (campus.value.length == 0) {
            alert('校区不能为空');
            return;
        }
        var book_id = this.getAttribute('book_id');
        var nbc_xhr = new XMLHttpRequest();
        nbc_xhr.open('POST', '/api/book/create_new_book_collection/' + book_id);
        nbc_xhr.setRequestHeader('Content-Type', 'application/json')
        nbc_xhr.send(JSON.stringify({
            collection_address: collection_address.value,
            campus: campus.value
        }));
        nbc_xhr.onreadystatechange = function(){
            if(nbc_xhr.readyState === 4){
                if(nbc_xhr.status === 201){
                    if(JSON.parse(nbc_xhr.responseText)['created'] == true)
                    {
                        alert('创建藏本成功');
                        hidden_hidden_div();
                    }
                }
            }
        }
    }
}

function hidden_hidden_div() {
    document.getElementsByClassName('hidden')[0].style.display = 'None';
    document.getElementById('addr').value = '';
    document.getElementById('campus').value = '';
}
