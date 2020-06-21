
app.controller('homeCont', function($rootScope,$scope,$http,$location) {
    /**
     * init variables when home screen load
     */
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



    //this function take a photo from camera ( work only in phonegap)
    /**
     * handler for taken picture from device camera
     */
    $scope.cameraTakePicture = function() {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: Camera.PictureSourceType.CAMERA,
            correctOrientation:true
        });
        // Success callback
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

            //get geo location
            $scope.getPosition();
            // $rootScope.currentReport.show  =  true;
            setTimeout(()=>{
                document.getElementById("addform").style.display='block';
                // alert(JSON.stringify($rootScope.currentReport));

            },1000);
        }
        // Fail callback
        function onFail(message) {
            alert('Failed because: ' + message);
        }
    };

    /**
     * handler for taken picture from device gallery
     */
    $scope.cameraTakePicture_fromGallery = function() {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG,
            correctOrientation:true
        });
        // Success callback
        function onSuccess(imageData) {
            var image = document.getElementById('myImage');
            image.src = imageData;
            $rootScope.currentReport.imgURI = imageData;
            image.style.height="400px";
            image.style.width="300px";
            document.getElementById("photo_flag").style.display='none';
            $rootScope.currentReport.class =  $scope.getClassification();
            //get geo location
            $scope.getPosition();

            setTimeout(()=>{
                document.getElementById("addform").style.display='block';
            },1000  );

        }
        // Fail callback
        function onFail(message) {
            alert('Failed because: ' + message);
        }
    };
    /**
     * get classification for given photo that inside the rootScope
     * using REST API call to  DL server
     */
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

    /**
     * handler to get geo location from GPS inside the device
     */
    $scope.getPosition = function(){
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 3000
        });
        // Success callback
        function onSuccess(position) {
            $rootScope.currentReport.lan  =  position.coords.latitude+"";
            $rootScope.currentReport.lon  =  position.coords.longitude+"";
        }
        // Error callback
        function onError(error) {
            if(error.code ===3){
                navigator.notification.confirm(
                    'Check the location is activated',  // message
                    undefined,        // callback
                    'Activate location',
                    ['close'],
                    undefined
                );
            }
            alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
        }
    };

    /**
     * activate the relevant handler base index given
     * @param index
     */
    $scope.one =function(index) {
        if(index === 1 )
            $scope.cameraTakePicture();
        else if (index===2)
            $scope.cameraTakePicture_fromGallery();
    };

    /**
     * pop up alert to choose between photo sources camera/gallery from the device
     */
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
    /**
     * upload the report to the server
     * with the following parameters:
     * the photo
     * date
     * geo location
     * description
     * photo classification
     */
    $scope.addReport = function () {
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
        var date = new Date();
        var curr_date = date.getUTCDate()+"/"+(date.getUTCMonth()+1)+"/"+date.getUTCFullYear();
        params.latitude = $rootScope.currentReport.lan;
        // params.latitude = 10;
        params.longitude =  $rootScope.currentReport.lon;
        // params.longitude = 55;
        params.date = curr_date;
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


    };
    /**
     * marking the best classification for a photo
     */
    $scope.init_class_selection = function(){
        $rootScope.currentReport.choosen_class = $rootScope.currentReport.class[0];
        let x = $rootScope.currentReport.class;
        document.getElementById("class1").style.background = "rgba(0,0,0,0.2)";
        document.getElementById("class1").value = x[0]+"";
        document.getElementById("class2").style.background = "white";
        document.getElementById("class2").value = x[1]+"";
        document.getElementById("class3").style.background = "white";
        document.getElementById("class3").value= x[2]+"";
    };
    //handler for user to change the default classification
    $scope.click1 = function(){
        $rootScope.currentReport.choosen_class = document.getElementById("class1").value;
        document.getElementById("class2").style.background = "white";
        document.getElementById("class1").style.background = "rgba(0,0,0,0.2)";
        document.getElementById("class3").style.background = "white";
    };

    //handler for user to change the default classification
    $scope.click2=function(){
        $rootScope.currentReport.choosen_class = document.getElementById("class2").value;
        document.getElementById("class1").style.background = "white";
        document.getElementById("class3").style.background = "white";
        document.getElementById("class2").style.background = "rgba(0,0,0,0.2)";
    };

    //handler for user to change the default classification
    $scope.click3=function(){
        $rootScope.currentReport.choosen_class = document.getElementById("class3").value;
        document.getElementById("class1").style.background = "white";
        document.getElementById("class2").style.background = "white";
        document.getElementById("class3").style.background = "rgba(0,0,0,0.2)";
    };


});

