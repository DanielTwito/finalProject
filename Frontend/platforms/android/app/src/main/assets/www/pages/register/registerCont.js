app.controller('regCont', function($rootScope,$scope,$http,$location) {


    $scope.init=function () {
        $scope.valid_username=false;
        $scope.valid_password=false;
        $scope.valid_fname=false;
        $scope.valid_lname=false;
        $scope.valid_neighborhood=false;
        $scope.valid_street=false;
        $scope.valid_email=false;
        $scope.valid_city=false;




    };
    $scope.isMatch = function (password, v_password) {
        if (password === undefined || v_password===undefined)
            return false;
        return password === v_password;

    };


    $scope.includeOnlyCharsWithSpaces=function(string){
        let ans =false;
        if(string === undefined)
            return ans ;
        string = string.replace(" ","");
        var patt = /^[a-zA-Z]+$/;
        ans =patt.test(string);
        return ans;
    };
    $scope.includeOnlyChars=function(string){
        let ans = false;
        if(string === undefined)
            return ans ;
        var patt = /^[a-zA-Z]+$/;
        ans = patt.test(string);
        return ans;
    };
    $scope.isUserNameValid=function(string){
        let ans = false;
        if(string === undefined)
            return ans ;
        var patt = /^[a-z0-9_-]{3,16}$/;
        ans = patt.test(string);
        return ans;
    };


    $scope.submit_handler=function () {
        $scope.init();
        let user = $scope.username;
        let email = $scope.u_email;
        let password = $scope.password;
        let v_password = $scope.v_password;
        let firstName = $scope.first_name;
        let lastName = $scope.last_name;
        let city = $scope.city;
        let neighborhood = $scope.neighborhood;
        let street = $scope.street;
        $scope.valid_username = !$scope.isUserNameValid(user);
        $scope.valid_password = !$scope.isMatch(password,v_password);
        $scope.valid_fname = !$scope.includeOnlyChars(firstName);
        $scope.valid_lname = !$scope.includeOnlyChars(lastName);
        $scope.valid_city = !$scope.includeOnlyChars(city);
        $scope.valid_neighborhood = !$scope.includeOnlyCharsWithSpaces(neighborhood);
        $scope.valid_street = !$scope.includeOnlyCharsWithSpaces(street);
        $scope.valid_email = !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email));
        let validation_form = !$scope.valid_username && !$scope.valid_password && !$scope.valid_fname
                              && !$scope.valid_lname && !$scope.valid_neighborhood && !$scope.valid_street
                              && !$scope.valid_email&& !$scope.valid_city;
        if ( validation_form ){
            $scope.send_request()
        }



    };

    $scope.send_request=function(){
        var req = {
            method: 'POST',
            url: SERVER_URL + '/register',
            data: {
                "userName":  $scope.username,
                "password": $scope.password,
                "firstName":$scope.first_name,
                "lastName": $scope.last_name,
                "city": $scope.city,
                "neighborhood": $scope.neighborhood,
                "street": $scope.street,
                "email" : $scope.u_email
            }
        };

        $http.post(req.url, JSON.stringify(req.data)).then((res) => {
               navigator.notification.confirm(
                   'Your details have been saved in our system',  // message
                   undefined,        // callback
                   'Registration completed successfully',            // title
                   ['Continue to login page'],
                   undefined// buttonName
               );
               $location.path("/login")

        }).catch((err)=>{
            navigator.notification.confirm(
                'User name already exist in the system',  // message
                undefined,        // callback
                'Registration Failed!',            // title
                ['Change User name'],
                undefined// buttonName
            );
        });
    };


});
