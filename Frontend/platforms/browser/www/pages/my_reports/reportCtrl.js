
app.controller('reportCtrl', function($rootScope,$scope,$http,$location) {

    /**
     * init the page with data getting from the server using REST API call
     */
    var req = {
        method: 'POST',
        url: SERVER_URL + '/getUserReports',
        headers:{'authrization': localStorage.getItem("token")},
        data: {}
    };

    $http(req).then((res) => {
        $scope.photo_list = res.data;
        $scope.show_div = $scope.photo_list[0] !== undefined;

    });
    //function to update photo inside the page dynamically
    $scope.getsrc= function (path) {return SERVER_URL+"/getReportImage?imagePath="+path;}

});

