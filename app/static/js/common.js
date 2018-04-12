function load_admin_username() {
    var au_xhr = new XMLHttpRequest();
    au_xhr.open('GET','/api/user/adminInfo');
    au_xhr.send();
    au_xhr.onreadystatechange = function(){
        if(au_xhr.readyState === 4){
            if(au_xhr.status === 200){
                document.getElementById('admin_username').innerText = JSON.parse(au_xhr.responseText)['adminName'];
            }
        }
    }
}

function logout() {
    var logout_xhr = new XMLHttpRequest();
    logout_xhr.open('GET', '/api/user/logout');
    logout_xhr.send();
    logout_xhr.onreadystatechange = function () {
        if (logout_xhr.readyState == 4) {
            if (logout_xhr.status == 200) {
                if (logout_xhr.getResponseHeader('Content-Type') === 'application/json') {
                    result = JSON.parse(logout_xhr.responseText);
                    window.location.href = result.page;
                }
            }
        }
    }
}