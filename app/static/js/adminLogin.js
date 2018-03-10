function value_verify(username, password) {
    var flag = true;
    if (username.value.length == 0) {
        username.classList.add('formInvalid');
        username.placeholder = '用户名不能为空';
        flag = false;
    }
    if (password.value.length == 0) {
        password.classList.add('formInvalid');
        password.placeholder = '密码不能为空';
        flag = false;
    }
    if (flag === false)
        return false;
    return true;
}

function login_req() {
    var username = document.getElementById('ad_user');
    var password = document.getElementById('ad_pwd');
    if (value_verify(username, password)) {
        var login_xhr = new XMLHttpRequest();
        login_xhr.open('POST', '/api/user/adminLogin');
        login_xhr.setRequestHeader('Content-Type', 'application/json');
        login_xhr.send(JSON.stringify({
            username: username.value,
            password: password.value
        }));
        login_xhr.onreadystatechange = function () {
            var DONE = 4;
            var OK = 200;
            if (login_xhr.readyState === DONE) {
                if (login_xhr.status === OK) {
                    if (login_xhr.getResponseHeader('Content-Type') === 'application/json') {
                        var result = JSON.parse(login_xhr.responseText);
                        if (result.login_statu === false) {
                            alert('服务器发生错误');
                        }
                        window.location.href = result.url;
                    }
                } else if (login_xhr.status === 401) {
                    var result = JSON.parse(login_xhr.responseText);
                    alert(result.reason);
                }
            }
        }
    }
}
