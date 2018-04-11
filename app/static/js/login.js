//验证用户名和密码
function value_verify(username, password) {
    var flag = true;//用于条件判断
    if (username.value.length == 0) {
        username.classList.add('formInvalid');//classList.add为元素添加类，invalid伪类高亮显示css
        username.placeholder = '用户名/邮箱不能为空';
        flag = false;//未达目标时将flag覆盖为false
    }
    if (password.value.length == 0) {
        password.classList.add('formInvalid');
        password.placeholder = '密码不能为空';
        flag = false;
    }
    if (flag === false)
        return false;
    return true;//在结束前判断flag为true则清除
}

function login_req() {
    var username = document.getElementById('txt');
    var password = document.getElementById('psw');
    if (value_verify(username, password)) {//如果验证正确
        var login_xhr = new XMLHttpRequest();//ajax
        login_xhr.open('POST', '/api/user/login');
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
                        window.location.href = result.page;
                    }
                } else if (login_xhr.status === 401) {
                    var result = JSON.parse(login_xhr.responseText);
                    alert(result.error);
                }
            }
        }
    }
}