function get_books() {
    delete_row();
    var book_name_input = document.getElementsByClassName('search_inp')[0];
    if (book_name_input.value.replace(/\s+/g, "").length == 0) {
        alert('书名不允许为空');
        return;
    }
    var b_xhr = new XMLHttpRequest();
    b_xhr.open('GET', '/api/book/getNameFullyCompliantBooks/' + book_name_input.value);
    b_xhr.send();
    b_xhr.onreadystatechange = function () {
        if (b_xhr.readyState === 4) {
            if (b_xhr.status === 200) {
                var result = JSON.parse(b_xhr.responseText);
                var table = document.getElementsByClassName('book_table')[0];
                for (var i = 0; i < result['length']; i++) {
                    var new_tr = document.createElement('tr');
                    var book_id_td = document.createElement('td');
                    book_id_td.innerText = result['books'][i]['id'];
                    var name_td = document.createElement('td');
                    name_td.innerText = result['books'][i]['name'];
                    var isbn_td = document.createElement('td');
                    isbn_td.innerText = result['books'][i]['isbn'];
                    var borrowable_td = document.createElement('td');
                    borrowable_td.innerText = result['books'][i]['borrowable_collections_nums'];
                    var borrowed_td = document.createElement('td');
                    borrowed_td.innerText = parseInt(result['books'][i]['book_collections_nums']) - parseInt(result['books'][i]['borrowable_collections_nums']);
                    var button_td = document.createElement('td');
                    var btn = document.createElement('button');
                    btn.innerText = '借书';
                    button_td.appendChild(btn);
                    new_tr.appendChild(book_id_td);
                    new_tr.appendChild(name_td);
                    new_tr.appendChild(isbn_td);
                    new_tr.appendChild(borrowable_td);
                    new_tr.appendChild(borrowed_td);
                    new_tr.appendChild(button_td);
                    table.appendChild(new_tr);
                    if (parseInt(result['books'][i]['borrowable_collections_nums']) === 0) {
                        btn.disabled = true;
                        btn.onclick = function () {
                            alert('该书籍目前暂时没有可借阅的藏本');
                        }
                    } else {
                        btn.className = 'borrow_book';
                        btn.setAttribute('book_id', result['books'][i]['id']);
                        btn.onclick = get_bc;
                    }
                }
            }
        }
    }
}

function get_bc () {
    var event = window.event; //获取当前窗口事件 
    var obj = event.srcElement ? event.srcElement : event.target;
    var w = document.getElementsByClassName('book_brw')[0];
    w.style.display = 'block';
    var book_id = obj.getAttribute('book_id');
    var bc_xhr = new XMLHttpRequest();
    bc_xhr.open('GET', '/api/book/book_collections/' + book_id);
    bc_xhr.send();
    bc_xhr.onreadystatechange = function(){
        if(bc_xhr.readyState === 4){
            if(bc_xhr.status === 200){
                var bc_result = JSON.parse(bc_xhr.responseText);
                var bul = document.getElementsByClassName('borrow_ul')[0];
                for(var i=0;i<bc_result['length'];i++){
                    if(bc_result['book_collections'][i]['statu'] == 0)
                        continue;
                    var new_li = document.createElement('li');
                    var new_ra = document.createElement('input');
                    new_ra.type = 'radio';
                    new_ra.name = 'check_inp';
                    new_ra.className = 'check_inp';
                    new_ra.value = bc_result['book_collections'][i]['book_collection_id'];
                    new_li.appendChild(new_ra);
                    var bc_span = document.createElement('span');
                    bc_span.innerHTML ='藏本编号' + bc_result['book_collections'][i]['book_collection_id'] + 
                    '&nbsp;&nbsp;' + bc_result['book_collections'][i]['collection_address'] +
                    '&nbsp;&nbsp;' + bc_result['book_collections'][i]['campus'];
                    new_li.appendChild(bc_span);
                    bul.appendChild(new_li);
                }
            }
        }
    }
}

function hidden_window(){
    var w = document.getElementsByClassName('book_brw')[0];
    w.style.display = 'None';
}

function delete_row(){
    var table = document.getElementsByClassName('book_table')[0];
    var rowNumber = table.rows.length;
    for(var i=0;i<rowNumber;i++){
        if(i!=0){
            table.deleteRow(i);
            rowNumber = rowNumber - 1;
            i = i-1;
        }
    }
}

function submit_b(){
    var username = document.getElementById('user_brw');
    if (username.value.replace(/\s+/g, "").length == 0) {
        alert('用户名不能为空');
        return;
    }
    var user_xhr = new XMLHttpRequest();
    var user_id;
    user_xhr.open('GET', '/api/user/getUserByUsername/' + username.value);
    user_xhr.send();
    user_xhr.onreadystatechange = function(){
        if(user_xhr.readyState === 4){
            if(user_xhr.status === 200){
                user_id = JSON.parse(user_xhr.responseText)['id'];
            }else{
                alert(JSON.parse(user_xhr.responseText)['reason']);
                return false;
            }
        }
    }
    if(user_id == null)
        return;
    var radios = document.getElementsByClassName('check_inp');
    var book_collection_id;
    for(var i=0;i<radios.length;i++){
        if(radios[i].checked)
            book_collection_id = radios[i].value;
    }
    
    var bor_xhr = new XMLHttpRequest();
    bor_xhr.open('POST', '/api/book/borrow');
    bor_xhr.setRequestHeader('Content-Type', 'application/json');
    bor_xhr.send(JSON.stringify({
        user_id: user_id,
        book_collection_id: book_collection_id
    }));
    bor_xhr.onreadystatechange = function(){
        if(bor_xhr.readyState === 4){
            if(bor_xhr.status === 201){
                alert(借阅成功);
                delete_row();
                get_bc();
            }
        }
    }
}