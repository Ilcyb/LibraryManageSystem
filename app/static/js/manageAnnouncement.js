function load_announcement() {
    var a_table = document.getElementById("ann_table");
    var a_xhr = new XMLHttpRequest();
    a_xhr.open("GET", "/api/user/getAllAnnouncement");
    a_xhr.send();
    a_xhr.onreadystatechange = function () {
        if (a_xhr.readyState === 4) {
            if (a_xhr.status === 200) {
                if (a_xhr.getResponseHeader("Content-Type") === "application/json") {
                    result = JSON.parse(a_xhr.responseText);
                    for (var i = 0; i < result['length']; i++) {
                        var p_tr = document.createElement("tr");
                        var p_td = document.createElement("td");
                        var p_td_a = document.createElement("a");
                        p_td_a.innerText = result["announcements"][i]["title"];
                        p_td_a.href = result["announcements"][i]["url"];
                        p_td.appendChild(p_td_a)
                        var t_p_td = document.createElement("td");
                        var e_span = document.createElement("span");
                        e_span.className = "edit";
                        e_span.id = "edit_" + result["announcements"][i]["id"];
                        e_span.innerText = "编辑";
                        e_span.addEventListener("click", function (event) {
                            edit(event.target);
                        }, false);
                        var d_span = document.createElement("span");
                        d_span.className = "delete";
                        d_span.id = "delete_" + result["announcements"][i]["id"];
                        d_span.innerText = "删除";
                        d_span.addEventListener("click", function (event) {
                            a_delete(event.target);
                        }, false);
                        t_p_td.appendChild(e_span);
                        t_p_td.appendChild(d_span);
                        p_tr.appendChild(p_td);
                        p_tr.appendChild(t_p_td);
                        a_table.appendChild(p_tr);
                    }
                }
            }
        }
    }
}

function edit(target) {
    ann_id = target.getAttribute("id").split("_")[1];
    var hidden_window = document.getElementById("hidden_ann_window");
    hidden_window.style.display = "block";
    var title_input = document.getElementById('edit_title');
    var content_input = document.getElementById('edit_content');
    var get_ann_xhr = new XMLHttpRequest();
    get_ann_xhr.open('GET', '/api/user/getAnnouncement/' + ann_id);
    get_ann_xhr.send();
    get_ann_xhr.onreadystatechange = function(){
        if(get_ann_xhr.readyState === 4){
            if(get_ann_xhr.status === 200){
                result = JSON.parse(get_ann_xhr.responseText);
                title_input.value = result['title'];
                content_input.value = result['content'];
            }else{
                alert('该公告不存在，请刷新页面');
                return;
            }
        }
    }
    var edit_submit = document.getElementById("save_form");
    edit_submit.setAttribute('ann_id', ann_id);
    edit_submit.onclick = function () {
        var title = document.getElementById('edit_title').value;
        var content = document.getElementById('edit_content').value;
        if (title.length == 0) {
            alert("公告标题不能为空");
            return;
        }
        if (content.length == 0) {
            alert("公告内容不能为空");
            return;
        }
        var ann_xhr = new XMLHttpRequest();
        ann_xhr.open("POST", "/api/user/editAnnouncement");
        ann_xhr.setRequestHeader("Content-Type", "application/json");
        ann_xhr.send(JSON.stringify({
            ann_id: ann_id,
            title: title,
            content: content
        }))
        ann_xhr.onreadystatechange = function () {
            if (ann_xhr.readyState === 4) {
                if (ann_xhr.status === 201) {
                    if (JSON.parse(ann_xhr.responseText)['edit_statu'] == true) {
                        alert('修改公告成功');
                        hidden_edit_window();
                        window.location.href = window.location.href;
                    }
                } else {
                    alert(JSON.parse(ann_xhr.responseText)['reason']);
                }
            }
        }
    }
}

function a_delete(target) {
    var ann_id = target.getAttribute("id").split("_")[1];
    var sure = confirm('确认删除吗？')
    if(!sure)
        return;
    var delete_xhr = new XMLHttpRequest();
    delete_xhr.open('GET', '/api/user/deleteAnnouncement/' + ann_id);
    delete_xhr.send();
    delete_xhr.onreadystatechange = function () {
        if (delete_xhr.readyState === 4) {
            if (delete_xhr.status === 200) {
                if (JSON.parse(delete_xhr.responseText)['delete_statu'] == true) {
                    window.location.href = window.location.href;
                }
            } else {
                alert(JSON.parse(delete_xhr.responseText)['reason']);
            }
        }
    }
}

function hidden_edit_window() {
    var hidden_window = document.getElementById("hidden_ann_window");
    hidden_window.style.display = "None";
    document.getElementById('edit_title').value = '';
    document.getElementById('edit_content').value = '';
}