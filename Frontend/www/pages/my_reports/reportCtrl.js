
app.controller('reportCtrl', function($rootScope,$scope,$http,$location) {
   // let t = localStorage.getItem('token');
    var req = {
        method: 'POST',
        url: SERVER_URL + '/getUserReports',
        headers:{'authrization': localStorage.getItem("token")},
        data: {}
    };

    // alert(JSON.stringify(req));
    $http(req).then((res) => {
        $scope.photo_list = res.data;
        if($scope.photo_list[0] === undefined){
            $scope.show_div = false;
        }else{
            $scope.show_div = true;

        }

    });

    $scope.getsrc= function (path) {

        return SERVER_URL+"/getReportImage?imagePath="+path;

    }

});

