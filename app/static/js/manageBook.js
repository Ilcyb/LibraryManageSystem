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
                            "<a class=\"e_c_m\" onclick=\"edit_book_collection()\">" +
                            "管理</a></span>";
                        var b_ed_td = document.createElement('td');
                        b_ed_td.innerHTML = "<span class=\"edit\" onclick=edit_book()>编辑</span><span class=\"delete\" onclick=delete_book()>删除</span>";
                        b_tr.appendChild(bc_ed_td);
                        b_tr.appendChild(b_ed_td);
                        table_body.appendChild(b_tr);
                        document.getElementsByClassName('e_c_m')[i].href = '/admin/manageBookCollection/' + result['books'][i]['book_id'];
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
        left_page.href = current_url + (parseInt(page) - 1);
    if (page == max_page)
        right_page.href = current_url + max_page;
    else
        right_page.href = current_url + (parseInt(page) + 1);
}

function jump_page() {
    var jump_page = document.getElementById('jump_text').value;
    var max_page = document.getElementById('right_num').innerText;
    if (jump_page > max_page)
        return
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

function delete_book(){
    var event = window.event; //获取当前窗口事件 
    var obj = event.srcElement ? event.srcElement : event.target;
    var book_id = obj.parentNode.parentNode.firstChild.innerText;
    var sure = confirm('确认删除吗？')
    if(!sure)
        return;
    var delete_xhr = new XMLHttpRequest();
    delete_xhr.open('GET', '/api/book/deleteBook/' + book_id);
    delete_xhr.send();
    delete_xhr.onreadystatechange = function(){
        if(delete_xhr.readyState === 4){
            if(delete_xhr.status === 200){
                alert('删除成功');
                window.location.reload();
            }else{
                alert(JSON.parse(delete_xhr.responseText)['reason']);
            }
        }
    }
}

function edit_book_collection(){

}

function edit_book(){
    var event = window.event; //获取当前窗口事件 
    var obj = event.srcElement ? event.srcElement : event.target;
    var book_id = obj.parentNode.parentNode.firstChild.innerText;
    var hidden_div = document.getElementsByClassName('book_edit')[0];
    hidden_div.style.display = 'block';
    var book_xhr = new XMLHttpRequest();
    book_xhr.open('GET', '/api/book/' + book_id);
    book_xhr.send();
    book_xhr.onreadystatechange = function(){
        if(book_xhr.readyState === 4){
            if(book_xhr.status === 200){
                result = JSON.parse(book_xhr.responseText);
                document.getElementById('book_name').value = result['book']['name'];
                authors = result['book']['authors'];
                if(authors.length > 1){
                    for(var i=0;i<authors.length-1;i++)
                    addAuthorInput();
                }
                author_inputs = document.getElementsByClassName('authors');
                for(var i=0;i<authors.length;i++){
                    author_inputs[i].value = authors[i];
                }
                getClassification();
                document.getElementById('e_book_isbn').value = result['book']['isbn'];
                document.getElementById('e_lang').value = result['book']['language'];
                document.getElementById('e_topic').value = result['book']['topic'];
                document.getElementById('e_ph').value = result['book']['publish_house'];
                document.getElementById('e_cn').value = result['book']['call_number'];
                document.getElementById('e_pd').value = result['book']['publish_date'];
                document.getElementById('e_img').value = result['book']['image'];
            }
        }
    }
    var submit = document.getElementById('save_form');
    submit.setAttribute('book_id', book_id);
    submit.onclick = function(){
        inputs = hidden_div.getElementsByTagName('input');
        for(var i=0;i<inputs.length;i++){
            if(inputs[i].value.length == 0){
                alert('请将书籍信息填写完整');
                return;
            }
        }
        var book_name = document.getElementById('book_name').value;
        var authors = []
        var authors_input = document.getElementById('authors_div').getElementsByTagName('input');
        for (var i = 0; i < authors_input.length; i++) {
            authors.push(authors_input[i].value);
        }
        var classification_id = document.getElementById('classification')[document.getElementById('classification').selectedIndex].value;
        var isbn = document.getElementById('e_book_isbn').value;
        var publish_house = document.getElementById('e_ph').value;
        var language = document.getElementById('e_lang').value;
        var topic = document.getElementById('e_topic').value;
        var publish_date = document.getElementById('e_pd').value;
        var call_number = document.getElementById('e_cn').value;
        var image = document.getElementById('e_img').value;
        var cnb_xhr = new XMLHttpRequest();
        cnb_xhr.open('POST', '/api/book/editBook');
        cnb_xhr.setRequestHeader('Content-Type', 'application/json');
        cnb_xhr.send(JSON.stringify({
            id: book_id,
            isbn: isbn,
            language: language,
            name: book_name,
            authors: authors,
            topic: topic,
            publish_house: publish_house,
            classification: classification_id,
            publish_date: publish_date,
            call_number: call_number,
            image: image
        }));
        cnb_xhr.onreadystatechange = function () {
            if (cnb_xhr.readyState === 4) {
                if (cnb_xhr.status === 201) {
                    if (cnb_xhr.getResponseHeader('Content-Type') === 'application/json') {
                        result = JSON.parse(cnb_xhr.responseText);
                        if (result['created'] === true) {
                            alert('修改图书信息成功');
                            window.location.href = window.location.href;
                        }
                    }
                } else {
                    alert(JSON.parse(cnb_xhr.responseText)['reason']);
                }
            }
        }
    }
}

function addAuthorInput() {
    var new_author_input = document.createElement('input');
    new_author_input.id = 'add_authors';
    new_author_input.className = 'authors';
    new_author_input.type = 'text';
    new_author_input.required = 'required';
    new_author_input.name = 'should_delete'
    var authors_div = document.getElementById('authors_div');
    authors_div.appendChild(new_author_input);
}

function hidden_book_edit(){
    document.getElementsByClassName('book_edit')[0].style.display = 'None';
    var authors_div = document.getElementById('authors_div');
    var should_deletes = document.getElementsByName('should_delete');
    for(var i=0;i<should_deletes.length;i++){
        authors_div.removeChild(should_deletes[i]);
    }
}

function getClassification() {
    var s_xhr = new XMLHttpRequest();
    s_xhr.open('GET', '/api/book/getClassifications');
    s_xhr.send()
    s_xhr.onreadystatechange = function () {
        if (s_xhr.readyState === 4) {
            if (s_xhr.status === 200) {
                if (s_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    result = JSON.parse(s_xhr.responseText);
                    var the_select = document.getElementById('classification');
                    for (var i = 0; i < result['length']; i++) {
                        var new_option = document.createElement('option');
                        new_option.value = result['classifications'][i]['classification_id'];
                        new_option.innerText = result['classifications'][i]['name'];
                        the_select.appendChild(new_option);
                    }
                }
            }
        }
    }
}

function getSubClassification() {
    var upper_classification = document.getElementById('classification')[document.getElementById('classification').selectedIndex].value;
    var s_xhr = new XMLHttpRequest();
    s_xhr.open('GET', '/api/book/getClassifications/' + upper_classification);
    s_xhr.send()
    s_xhr.onreadystatechange = function () {
        if (s_xhr.readyState === 4) {
            if (s_xhr.status === 200) {
                if (s_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    result = JSON.parse(s_xhr.responseText);
                    if(result['is_finaly'] === true)
                        return;
                    var the_select = document.getElementById('classification');
                    the_select.options.length = 0;
                    // var old_options = the_select.getElementsByTagName('option');
                    // for (var j = 0; j < old_options.length; j++) {
                    //     the_select.removeChild(old_options[j]);
                    // }
                    for (var i = 0; i < result['length']; i++) {
                        var new_option = document.createElement('option');
                        new_option.value = result['classifications'][i]['classification_id'];
                        new_option.innerText = result['classifications'][i]['name'];
                        the_select.appendChild(new_option);
                    }
                }
            }
        }
    }
}