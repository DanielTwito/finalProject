app.controller('loginCont', function($rootScope,$scope,$http,$location) {

    /**
     *login handler take the values from the inputs
     */
    $scope.login_handler = function () {
        let username = $scope.login_username;
        let password = $scope.login_password;
        if(username!=="" && password !=="") {
            $scope.login(username, password);
        }else{
            navigator.notification.confirm(
                'Incorrect user name or password',  // message
                undefined,        // callback
                'Login failed',
                ['Try again'],
                undefined
            );
        }
};
    /**
     * make a post request to the server using REST API to login
     * @param uname - user name
     * @param password - password
         */
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
                navigator.notification.confirm(
                    'Incorrect user name or password',  // message
                    undefined,        // callback
                    'Login failed',
                    ['Try again'],
                    undefined
                );
            });

        }

    }



);

