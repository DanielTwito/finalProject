let app = angular.module('myApp', ["ngRoute"]);

app.controller('navCtrl', function($location, $rootScope, $scope, $http) {

    $scope.myinit = function () {
        $rootScope.logged_flag=false;

    }

    $scope.signOut = function () {
        localStorage.removeItem("token");
        localStorage.removeItem("logged_user");
        $rootScope.logged_flag=false;
        $location.path('/home');

    }

});

app.config(function($routeProvider)  {
    $routeProvider
        // homepage
        .when('/', {
            // this is a template
            templateUrl: 'pages/home/home.html'
        })
        .when('/home', {
            // this is a template
            templateUrl: 'pages/home/home.html'
        })
        .when('/add_report', {
            // this is a template
            templateUrl: 'pages/add_report/add_report.html'
        })

        .when('/register', {
            // this is a template
            templateUrl: 'pages/register/register.html'
        })
        //login
        .when('/login', {
            // this is a template
            templateUrl: 'pages/login/login.html'
        })

        // my_reports
        .when('/my_reports', {
            templateUrl: 'pages/my_reports/my_reports.html',
        })
        // other
        .otherwise({ redirectTo: '/' });
});


