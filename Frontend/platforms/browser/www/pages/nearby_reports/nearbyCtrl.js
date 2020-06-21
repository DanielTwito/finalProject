app.controller('nearByCtrl', function($rootScope,$scope,$http,$location) {
    // let t = localStorage.getItem('token');
    //handler for get geo location from the device
    $scope.getPosition = function(){
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 3000
        });
        //Success callback
        function onSuccess(position) {
            $scope.lan  =  position.coords.latitude+"";
            $scope.lon  =  position.coords.longitude+"";
        }
        //Error callback
        function onError(error) {
            alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
        }
    };
    /**
     * init the page with data getting from the server using REST API call
     */
    $scope.getPosition();
    setTimeout(()=>{
        var req = {
            method: 'POST',
            url: SERVER_URL + '/getNearbyUserReports',
            headers:{'authrization': localStorage.getItem("token")},
            data: {
                "longitude":  $scope.lon ,
                "latitude":   $scope.lan
            }
        };

        $http(req).then((res) => {
            $scope.photo_list = res.data;
            $scope.show_div = $scope.photo_list[0] !== undefined;

        });
    },2000);
    //function to update photo inside the page dynamically
    $scope.getsrc= function (path) {return SERVER_URL+"/getReportImage?imagePath="+path;}

});
