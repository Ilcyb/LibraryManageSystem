function get_personal_info() {
    var pi_xhr = new XMLHttpRequest();
    pi_xhr.open('GET', '/api/user/personalInfo');
    pi_xhr.send();
    pi_xhr.onreadystatechange = function () {
        if (pi_xhr.readyState === 4) {
            if (pi_xhr.status === 200) {
                var result = JSON.parse(pi_xhr.responseText);
                if (result['name'] == null)
                    result['name'] = '暂无';
                document.getElementsByClassName('per_name')[0].innerText = '姓名：' + result['name'];
                document.getElementsByClassName('per_username')[0].innerText = '用户名：' + result['username'];
                document.getElementsByClassName('per_email')[0].innerText = '电子邮箱：' + result['email'];
                if (result['sex'] == null)
                    result['sex'] = '暂无';
                else if (result['sex'] == true)
                    result['sex'] = '男';
                else if (result['sex'] == false)
                    result['sex'] = '女';
                document.getElementsByClassName('per_sex')[0].innerText = '性别：' + result['sex'];
                document.getElementsByClassName('per_level')[0].innerText = '等级：' + result['level'];
                if (result['insitution'] == null)
                    result['insitution'] = '暂无';
                document.getElementsByClassName('per_ins')[0].innerText = '学院：' + result['insitution'];
                document.getElementsByClassName('per_book_num')[0].innerText = '可借书数量：' + result['can_lended_nums'];
            }
        }
    }
}

function get_lending_info() {
    var ldi_xhr = new XMLHttpRequest();
    ldi_xhr.open('GET', '/api/user/lendingHistory');
    ldi_xhr.send();
    ldi_xhr.onreadystatechange = function () {
        if (ldi_xhr.readyState === 4) {
            if (ldi_xhr.status === 200) {
                var result = JSON.parse(ldi_xhr.responseText);
                var ld_table = document.getElementsByClassName('per_borrow')[0];
                for (var i = 0; i < result['length']; i++) {
                    var new_tr = document.createElement('tr');
                    var bn_td = document.createElement('td');
                    var bn_a = document.createElement('a');
                    bn_a.href = '/book/' + result['lend_info'][i]['book_id'];
                    bn_a.innerText = result['lend_info'][i]['book_name'];
                    bn_td.appendChild(bn_a);
                    new_tr.appendChild(bn_td);
                    var ldt_td = document.createElement('td');
                    ldt_td.innerText = result['lend_info'][i]['lend_time'];
                    new_tr.appendChild(ldt_td);
                    var gh_td = document.createElement('td');
                    var ex_td = document.createElement('td');
                    var bat_td = document.createElement('td');
                    var bbtn = document.createElement('button');
                    bbtn.innerText = '续借';
                    bbtn.value = 'lendinfo_' + result['lend_info'][i]['lending_info_id'];
                    bbtn.onclick = re_borrow;
                    bat_td.appendChild(bbtn);
                    if (result['lend_info'][i]['returned']) {
                        gh_td.innerText = '是';
                        ex_td.innerText = '已归还';
                        bbtn.disabled = false;
                    } else {
                        gh_td.innerText = '否';
                        ex_td.innerText = result['lend_info'][i]['expected_return_time'];
                        disabled = true;
                    }
                    new_tr.appendChild(gh_td);
                    new_tr.appendChild(ex_td);
                    new_tr.appendChild(bat_td);
                    ld_table.appendChild(new_tr);
                }
            }
        }
    }
}

function re_borrow() {
    var event = window.event; //获取当前窗口事件 
    var obj = event.srcElement ? event.srcElement : event.target;
    var ld_id = obj.value.split('_')[1];
    var rn_xhr = new XMLHttpRequest();
    rn_xhr.open('GET', '/api/user/renew/' + ld_id);
    rn_xhr.send();
    rn_xhr.onreadystatechange = function () {
        if (rn_xhr.readyState === 4) {
            if (rn_xhr.status === 200) {
                alert('续借成功');
                window.location.reload();
            } else {
                alert(JSON.parse(rn_xhr.responseText)['reason']);
            }
        }
    }
}

function get_comments() {
    var c_xhr = new XMLHttpRequest();
    c_xhr.open('GET', '/api/user/commentHistory');
    c_xhr.send();
    c_xhr.onreadystatechange = function () {
        if (c_xhr.readyState === 4) {
            if (c_xhr.status === 200) {
                var result = JSON.parse(c_xhr.responseText);
                var comments = document.getElementsByClassName('my_comment')[0];
                for (var i = 0; i < result['length']; i++) {
                    var book_h5 = document.createElement('h5');
                    var book_a = document.createElement('a');
                    book_a.href = '/book/' + result['comments'][i]['book_id'];
                    book_a.innerText = result['comments'][i]['book_name'];
                    book_h5.appendChild(book_a)
                    var comment_time_span = document.createElement('span');
                    comment_time_span.innerText = result['comments'][i]['comment_time'];
                    var comment_content_p = document.createElement('p');
                    comment_content_p.innerText = result['comments'][i]['content'];
                    comments.appendChild(book_h5);
                    comments.appendChild(comment_time_span);
                    comments.appendChild(comment_content_p);
                }
            }
        }
    }
}

function getLevels() {
    var s_xhr = new XMLHttpRequest();
    s_xhr.open('GET', '/api/user/getLevels');
    s_xhr.send()
    s_xhr.onreadystatechange = function () {
        if (s_xhr.readyState === 4) {
            if (s_xhr.status === 200) {
                if (s_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    result = JSON.parse(s_xhr.responseText);
                    var the_select = document.getElementById('edit_level');
                    for (var i = 0; i < result['length']; i++) {
                        var new_option = document.createElement('option');
                        new_option.value = result['levels'][i]['level_id'];
                        new_option.innerText = result['levels'][i]['name'];
                        the_select.appendChild(new_option);
                    }
                }
            }
        }
    }
}

function edit_personal_info() {
    var popups = document.getElementsByClassName('personal_edit')[0];
    popups.style.display = 'block';
    var pi_xhr = new XMLHttpRequest();
    var name = document.getElementById('edit_name');
    var ins = document.getElementById('edit_ins');
    var sex = document.getElementById('edit_sex');
    var level = document.getElementById('edit_level');
    pi_xhr.open('GET', '/api/user/personalInfo');
    pi_xhr.send();
    pi_xhr.onreadystatechange = function () {
        if (pi_xhr.readyState === 4) {
            if (pi_xhr.status === 200) {
                var result = JSON.parse(pi_xhr.responseText);
                name.value = result['name'];
                ins.value = result['insitution'];
            }
        }
    }
    var submit = document.getElementById('edit_save');
    submit.onclick = function(){
        if(name.value.replace(/\s+/g,"").length == 0 || ins.value.replace(/\s+/g,"").length == 0){
            alert('请将修改信息填写完整');
            return;
        }
        var ep_xhr = new XMLHttpRequest();
        ep_xhr.open('POST', '/api/user/personalInfo');
        ep_xhr.setRequestHeader('Content-Type', 'application/json');
        ep_xhr.send(JSON.stringify({
            name: name.value,
            sex: document.getElementById('edit_sex')[document.getElementById('edit_sex').selectedIndex].value,
            insitution: ins.value,
            level_id: parseInt(document.getElementById('edit_level')[document.getElementById('edit_level').selectedIndex].value)
        }));
        ep_xhr.onreadystatechange = function(){
            if(ep_xhr.readyState === 4){
                if(ep_xhr.status === 201){
                    alert('修改个人信息成功');
                    window.location.reload();
                }else{
                    alert(JSON.parse(ep_xhr.responseText)['reason']);
                }
            }
        }
    }
}

function hidden_pernal_info_popups() {
    var popups = document.getElementsByClassName('personal_edit')[0];
    popups.style.display = 'None';
    var name = document.getElementById('edit_name');
    var ins = document.getElementById('edit_ins');
    name.value = '';
    ins.value = '';
}