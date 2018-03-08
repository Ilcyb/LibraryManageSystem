function createNewBook() {
    var book_name = document.getElementById('book_name').value;
    var authors = []
    var authors_input = document.getElementById('authors_div').getElementsByTagName('input');
    for (var i = 0; i < authors_input.length; i++) {
        authors.push(authors_input[i].value);
    }
    var classification = document.getElementById('classification')[document.getElementById('classification').selectedIndex].text;
    var isbn = document.getElementById('isbn').value;
    var publish_house = document.getElementById('publish_house').value;
    var language = document.getElementById('language').value;
    var topic = document.getElementById('topic').value;
    var publish_date = document.getElementById('publish_date').value;
    var call_number = document.getElementById('call_number').value;
    var image = document.getElementById('image').value;
    var cnb_xhr = new XMLHttpRequest();
    cnb_xhr.open('POST', '/api/book/book');
    cnb_xhr.setRequestHeader('Content-Type', 'application/json');
    cnb_xhr.send(JSON.stringify({
        isbn: isbn,
        language: language,
        name: book_name,
        authors: authors,
        topic: topic,
        publish_house: publish_house,
        classification: classification,
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
                        alert('创建 ' + result['created_book']['name'] + ' 成功');
                        window.location.href = result['url'];
                    }
                }
            } else {
                alert(JSON.parse(cnb_xhr.responseText)['reason']);
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
    var authors_div = document.getElementById('authors_div');
    authors_div.appendChild(new_author_input);
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