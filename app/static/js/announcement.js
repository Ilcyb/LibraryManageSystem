function load_ann(){
    var ann_id = window.location.href.split('/').pop();
    var ann_xhr = new XMLHttpRequest();
    ann_xhr.open('GET', '/api/user/getAnnouncement/' + ann_id);
    ann_xhr.send();
    ann_xhr.onreadystatechange = function(){
        if(ann_xhr.readyState === 4){
            if(ann_xhr.status === 200){
                var result = JSON.parse(ann_xhr.responseText);
                document.getElementById('notice_caption').innerText = result['title'];
                document.getElementById('notice_content').innerText = result['content'];
            }
        } 
    }
}