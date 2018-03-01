function value_verify(username, email, password, re_password) {
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
    if (email.value.length == 0) {
        email.classList.add('formInvalid');
        email.placeholder = '邮箱不能为空';
        flag = false;
    }
    if (re_password.value.length == 0) {
        re_password.classList.add('formInvalid');
        re_password.placeholder = '重复密码不能为空';
        flag = false;
    } else if (re_password.value != password.value) {
        re_password.value = '';
        re_password.classList.add('formInvalid');
        re_password.placeholder = '重复密码与密码不相同';
        flag = false;
    }
    if (flag === false)
        return false;
    return true;
}

function register_req(){
    var username = document.getElementById('username');
    var password = document.getElementById('password');
    var email = document.getElementById('email');
    var re_password = document.getElementById('once_password');
    if(value_verify(username, email, password, re_password)){
        reg_xhr = new XMLHttpRequest();
        reg_xhr.open('POST', '/api/user/register');
        reg_xhr.setRequestHeader('Content-Type', 'application/json');
        reg_xhr.send(JSON.stringify({username: username.value, email: email.value, password: password.value}));
        reg_xhr.onreadystatechange = function(){
            var DONE = 4;
            var OK = 200;
            if(reg_xhr.readyState == DONE){
                if(reg_xhr.status == OK){
                    if(reg_xhr.getResponseHeader('Content-Type') === 'application/json'){
                        var result = JSON.parse(reg_xhr.responseText);
                        if(result.register_statu === true){
                            window.location.href = result.page;
                        }else if(result.register_statu === false){
                            alert(result.error);
                        }
                    }
                }
            }
        }
    }
}