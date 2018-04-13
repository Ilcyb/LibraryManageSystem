function load_book_collection() {
    var book_id = window.location.href.split('/').pop();
    var bc_xhr = new XMLHttpRequest();
    bc_xhr.open('GET', '/api/book/book_collections/' + book_id);
    bc_xhr.send();
    bc_xhr.onreadystatechange = function () {
        if (bc_xhr.readyState === 4) {
            if (bc_xhr.status === 200) {
                result = JSON.parse(bc_xhr.responseText);
                bc_table = document.getElementsByClassName('book_table')[0];
                for (var i = 0; i < result['length']; i++) {
                    var new_tr = document.createElement('tr');
                    var bcid_td = document.createElement('td');
                    bcid_td.innerText = result['book_collections'][i]['book_collection_id'];
                    var addr_td = document.createElement('td');
                    addr_td.innerText = result['book_collections'][i]['collection_address'];
                    var campus_td = document.createElement('td');
                    campus_td.innerText = result['book_collections'][i]['campus'];
                    var edit_td = document.createElement('td');
                    var edit_span = document.createElement('span');
                    edit_span.className = 'collection_edit';
                    edit_span.innerText = '编辑';
                    edit_span.id = 'edit_' + result['book_collections'][i]['book_collection_id'];
                    edit_span.onclick = edit_bc;
                    var delete_span = document.createElement('span');
                    delete_span.className = 'collection_delete';
                    delete_span.innerText = '删除';
                    delete_span.id = 'delete_' + result['book_collections'][i]['book_collection_id'];
                    delete_span.onclick = delete_bc;
                    edit_td.appendChild(edit_span);
                    edit_td.appendChild(delete_span);
                    new_tr.appendChild(bcid_td);
                    new_tr.appendChild(addr_td);
                    new_tr.appendChild(campus_td);
                    new_tr.appendChild(edit_td);
                    bc_table.appendChild(new_tr);
                }
            }
        }
    }
}

function edit_bc() {
    var event = window.event; //获取当前窗口事件 
    var obj = event.srcElement ? event.srcElement : event.target;
    var bc_id = obj.id.split('_')[1];
    var popups = document.getElementsByClassName('mask_collection')[0];
    popups.style.display = 'block';
    var submit = document.getElementById('save_form');
    var cancel = document.getElementById('cancel_form')
    var getinfo_xhr = new XMLHttpRequest();
    var addr = document.getElementById('book_addr');
    var campus = document.getElementById('book_campus');
    getinfo_xhr.open('GET', '/api/book/bookcollection/' + bc_id);
    getinfo_xhr.send();
    getinfo_xhr.onreadystatechange = function () {
        if (getinfo_xhr.readyState === 4) {
            if (getinfo_xhr.status === 200) {
                addr.value = JSON.parse(getinfo_xhr.responseText)['collection_address'];
                campus.value = JSON.parse(getinfo_xhr.responseText)['campus'];
            }
        }
    }
    submit.onclick = function () {
        if (addr.value.replace(/\s+/g, "").length == 0 || campus.value.replace(/\s+/g, "").length == 0) {
            alert('请将修改信息填写完整');
            return;
        }
        var sub_xhr = new XMLHttpRequest();
        sub_xhr.open('POST', '/api/book/bookcollection');
        sub_xhr.setRequestHeader('Content-Type', 'application/json');
        sub_xhr.send(JSON.stringify({
            id: bc_id,
            address: addr.value,
            campus: campus.value
        }));
        sub_xhr.onreadystatechange = function(){
            if(sub_xhr.readyState === 4){
                if(sub_xhr.status === 201){
                    alert('修改成功');
                    window.location.reload();
                }else{
                    alert(JSON.parse(sub_xhr.responseText)['reason']);
                }
            }
        }
    }
}

function hidden_bc_edit() {
    var popups = document.getElementsByClassName('mask_collection')[0];
    var addr = document.getElementById('book_addr');
    var campus = document.getElementById('book_campus');
    addr.value = '';
    campus.value = '';
    popups.style.display = 'None';
}

function delete_bc() {
    var event = window.event; //获取当前窗口事件 
    var obj = event.srcElement ? event.srcElement : event.target;
    var bc_id = obj.id.split('_')[1];
    var del_xhr = new XMLHttpRequest();
    del_xhr.open('GET', '/api/book/deleteBookCollection/' + bc_id);
    del_xhr.send();
    del_xhr.onreadystatechange = function(){
        if(del_xhr.readyState === 4){
            if(del_xhr.status === 200){
                alert('删除成功');
                window.location.reload();
            }else{
                alert(JSON.parse(del_xhr.responseText)['reason']);
            }
        }
    }
}