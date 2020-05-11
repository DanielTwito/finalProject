
app.controller('homeCont', function($rootScope,$scope,$http,$location) {
    $scope.home_init = function(){
        if ( localStorage.getItem("token") === null){
            return;
        }
        $rootScope.currentReport={};
       // / $scope.show_form = false;
        $rootScope.logUser = localStorage.getItem("logged_user");
        $rootScope.logged_flag=true;
        $location.path('/home');

    };

    $scope.test=function() {
        $rootScope.currentReport.imgURI = "img/person_1.jpg";
        image.style.height = "400px";
        image.style.width = "300px";
        $rootScope.currentReport.class = $scope.getClassification();
        //get location of the given photo

        $scope.getPosition();

        setTimeout(() => {
            // $rootScope.currentReport.show  =  true;
            $rootScope.currentReport.lan = $scope.a;
            $rootScope.currentReport.lon = $scope.b;
            document.getElementById("addform").style.display = 'block';
            // alert(JSON.stringify($rootScope.currentReport));
        }, 3000);


    };

    //this function take a photo from camera ( work only in phonegap)
    $scope.cameraTakePicture = function() {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: Camera.PictureSourceType.CAMERA,
            correctOrientation:true
        });

        function onSuccess(imageData) {
            var image = document.getElementById('myImage');
            // image.src = "data:image/jpeg;base64," + imageData;
            image.src =  imageData;
            image.style.height="400px";
            image.style.width="300px";
            $rootScope.currentReport.imgURI = imageData;
            // alert(imageData);
            image.style.height="400px";
            image.style.width="300px";
            document.getElementById("photo_flag").style.display='none';
            $rootScope.currentReport.class =  $scope.getClassification();

            //get location of the given photo
            $scope.getPosition();
            // $rootScope.currentReport.show  =  true;
            setTimeout(()=>{
                document.getElementById("addform").style.display='block';
                // alert(JSON.stringify($rootScope.currentReport));

            },1000);
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        }
    };


    $scope.cameraTakePicture_fromGallery = function() {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG,
            correctOrientation:true
        });

        function onSuccess(imageData) {
            var image = document.getElementById('myImage');
            image.src = imageData;
            $rootScope.currentReport.imgURI = imageData;
            image.style.height="400px";
            image.style.width="300px";
            document.getElementById("photo_flag").style.display='none';
            $rootScope.currentReport.class =  $scope.getClassification();
            //get location of the given photo

            $scope.getPosition();

            setTimeout(()=>{
                document.getElementById("addform").style.display='block';
            },1000  );

        }

        function onFail(message) {
            alert('Failed because: ' + message);
        }
    };
    $scope.getClassification = function(){
        let imageData = $rootScope.currentReport.imgURI;
        var url = encodeURI(SERVER_URL +"/model_predict");
        var options = new FileUploadOptions();
        options.fileKey = "file"; //depends on the api
        options.fileName = imageData.substr(imageData.lastIndexOf('/')+1);
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;
        options.headers = {
            'authrization': localStorage.getItem('token')
        };
        var ft = new FileTransfer();
        // ft.upload(imageData, url, (res)=> alert(JSON.stringify(res.response)), (err)=>{alert(JSON.stringify(err))}, options);
        var params = {};
        options.params = params;
        ft.upload( imageData, url, (res)=> {
            $rootScope.currentReport.class =JSON.parse(res.response).predictions;
            $scope.init_class_selection();
        }, (err)=>{alert(JSON.stringify(err))}, options);

    };
    $scope.getPosition = function(){
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 3000
        });

        function onSuccess(position) {
            $rootScope.currentReport.lan  =  position.coords.latitude+"";
            $rootScope.currentReport.lon  =  position.coords.longitude+"";
        }

        function onError(error) {
            alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
        }
    };

    $scope.one =function(index) {
        if(index === 1 )
            $scope.cameraTakePicture();
        else if (index===2)
            $scope.cameraTakePicture_fromGallery();
    };

    $scope.choose_source=function(){
        $scope.text_show = false;
        navigator.notification.confirm(
            'Choose from gallery or camera',  // message
            $scope.one,        // callback
            'Source Select',            // title
            ['Camera','Gallery']    ,
            undefined// buttonName
        );
    };

    $scope.addReport = function () {
        let photo_disc = $scope.photo_description;
        let imageData = $rootScope.currentReport.imgURI;
        var url = encodeURI(SERVER_URL +"/addReport");
        var options = new FileUploadOptions();
        // imageData = "/img/person_2.jpg";

        options.fileKey = "file"; //depends on the api
        options.fileName = imageData.substr(imageData.lastIndexOf('/')+1);
        options.mimeType = "image/jpeg";
        options.headers = {
            'authrization': localStorage.getItem('token')
        };
        // options.chunkedMode = false; //this is important to send both data and files
        var ft = new FileTransfer();
        // ft.upload(imageData, url, (res)=> alert(JSON.stringify(res.response)), (err)=>{alert(JSON.stringify(err))}, options);
        var params = {};
        params.latitude = $rootScope.currentReport.lan;
        // params.latitude = 10;
        params.longitude =  $rootScope.currentReport.lon;
        // params.longitude = 55;
        params.date = Date.now();
        params.class = $rootScope.currentReport.choosen_class;
        params.description = $scope.p_description;
        // alert(JSON.stringify(params));
        options.params = params;
        options.chunkedMode = false;

        // url=encodeURI(SERVER_URL +"/addReport");
        ft.upload( imageData, url, (res)=>{
            navigator.notification.confirm(
                'Your report has been saved',  // message
                undefined,        // callback
                'Report added successfully',            // title
                ['OK'],
                undefined// buttonName
            );
            $location.path('/home');
            }, (err)=>{alert(JSON.stringify(err))}, options);
        // alert($scope.photo_description);


    };
    $scope.init_class_selection = function(){
        $rootScope.currentReport.choosen_class = $rootScope.currentReport.class[0];
        // alert($rootScope.currentReport.class);
        let x = $rootScope.currentReport.class;
        document.getElementById("class1").style.background = "rgba(0,0,0,0.2)";
        document.getElementById("class1").value = x[0]+"";
        document.getElementById("class2").style.background = "white";
        document.getElementById("class2").value = x[1]+"";
        document.getElementById("class3").style.background = "white";
        document.getElementById("class3").value= x[2]+"";
    };
    $scope.click1 = function(){
        $rootScope.currentReport.choosen_class = document.getElementById("class1").value;
        document.getElementById("class2").style.background = "white";
        document.getElementById("class1").style.background = "rgba(0,0,0,0.2)";
        document.getElementById("class3").style.background = "white";
    };


    $scope.click2=function(){
        $rootScope.currentReport.choosen_class = document.getElementById("class2").value;
        document.getElementById("class1").style.background = "white";
        document.getElementById("class3").style.background = "white";
        document.getElementById("class2").style.background = "rgba(0,0,0,0.2)";
    };


    $scope.click3=function(){
        $rootScope.currentReport.choosen_class = document.getElementById("class3").value;
        document.getElementById("class1").style.background = "white";
        document.getElementById("class2").style.background = "white";
        document.getElementById("class3").style.background = "rgba(0,0,0,0.2)";
    };





});

