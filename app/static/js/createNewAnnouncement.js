function addAnnouncement(){
    var title = document.getElementById("text_caption").value;
    var content = document.getElementById("text_content").value;
    if(title.length === 0){
        alert("公告标题不能为空");
        return;
    }
    else if(content.length === 0){
        alert("公告内容不能为空");
        return;
    }

    var axhr = new XMLHttpRequest();
    axhr.open('POST', '/api/user/addAnnouncement');
    axhr.setRequestHeader('Content-Type', 'Application/json');
    axhr.send(JSON.stringify({
        title: title,
        content: content
    }));
    axhr.onreadystatechange = function(){
        if (axhr.readyState === 4) {
            if (axhr.status === 201) {
                if (axhr.getResponseHeader('Content-Type') === 'application/json') {
                    result = JSON.parse(axhr.responseText);
                    if (result['created'] === true) {
                        alert('公告创建成功');
                        window.location.href = window.location.href;
                    }
                }
            } else {
                alert(JSON.parse(axhr.responseText)['error']);
            }
        }
    }
}