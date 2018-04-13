function borrow(){
    var bc_id = document.getElementById('book_collection_id');
    var user_id = document.getElementById('user_id');
    if(bc_id.value.replace(/\s+/g,"").length == 0 || user_id.value.replace(/\s+/g,"").length == 0){
        alert('请将借阅信息填写完整');
        return;
    }
    var b_xhr = new XMLHttpRequest();
    b_xhr.open('POST', '/api/book/borrow');
    b_xhr.setRequestHeader('Content-Type', 'application/json');
    b_xhr.send(JSON.stringify({
        user_id: user_id.value,
        book_collection_id: bc_id.value
    }));
    b_xhr.onreadystatechange = function(){
        if(b_xhr.readyState === 4){
            if(b_xhr.status === 201){
                alert('添加借阅信息成功');
                window.location.reload();
            }else{
                alert(JSON.parse(b_xhr.responseText)['reason']);
            }
        }
    }
}