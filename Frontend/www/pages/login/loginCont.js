app.controller('loginCont', function($rootScope,$scope,$http,$location) {


    $scope.login_handler = function () {
        let username = $scope.login_username;
        let password = $scope.login_password;
        if(username!=="" && password !=="") {
            $scope.login(username, password);
        }else{
            alert("you must fill username and password");
        }
};

    $scope.login = function (uname,password) {

            var req = {
                method: 'POST',
                url: SERVER_URL +'/login',
                data:{
                    "userName": uname,
                    "password":password
                }
            };

            $http.post(req.url, JSON.stringify(req.data)).then((res) => {

                localStorage.setItem("token", res.data);
                localStorage.setItem("logged_user", uname);
                $rootScope.logUser = uname;
                $rootScope.logged_flag=true;
                $location.path('/home');

            }).catch((res)=>{
                alert(res.data);
            });

        }

    }



);

