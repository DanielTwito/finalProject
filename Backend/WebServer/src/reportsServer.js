var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
var userNameReg = /^[a-zA-Z0-9]*$/;
var passReg =   /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/;
var express = require('express');
var cors = require('cors');
var DButilsAzure = require('./DButils');
var authManager = require('./AuthManager');
var fs = require('fs');
var classificationModelHostname = 'localhost'
var classificationModelPort = 5000
var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var app = express();
var isMultipart = /^multipart\//i;

// const multer  = require('multer');
const formidable = require('formidable');
const dirName = "uploads/tmp/"

// // SET STORAGE
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + ".jpg")
//   }
// })
 
// var upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 1024 * 1024 * 5
//     }
//  });

app.use(cors());
var port = 3000;
var server = app.listen(port, 'localhost' ,function () {
    console.log('Server  listening on port :  ' + port);
});


var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/getUserReports', authManager.validate);
app.use('/getAllReports', authManager.validate);
app.use('/addReport', authManager.validate);



app.post('/addReport', function(req, res){
    var queryFields = "userName, date, longitude, latitude, neighborhood, img, description, class";
    
    var userName = req.body.userName;
    var imagePath;
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
      var oldpath = files.file.path;
      imagePath = 'uploads' + oldpath + Date.now() + ".jpg";
      fs.rename(oldpath, imagePath, function (err) {
        if (err) throw err;
      });

      var sql = "INSERT INTO reports ("+queryFields+") VALUES ('" + userName + "','" + fields.date + "','" + fields.longitude + "','" + fields.latitude + "','" + "NULL" + "','" + imagePath + "','" + fields.description + "','" + fields.class + "')";

        DButilsAzure.execQuery(sql)
            .then(function(result){
                res.status(200).send("Report added successfully.")
            })
            .catch(function(err){
                console.log(err);
                res.status(500).send(err);
            })
    });

});

app.use('/login', function(req, res ,next){
    DButilsAzure.execQuery("SELECT * FROM users")
        .then(function(result){
            var users = result;
            var userRequestData = req.body;
            for (const user of users) {
                if(user["userName"] === userRequestData["userName"] ){
                    if(user["password"] === userRequestData["password"] ){
                        next();
                        return;
                    }
                }
            }
            //401 mean unauthorized user
                res.status(401).send("Incorrect userName or password")
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});

//CHECK!
app.get('/', function(req, res){
    res.status(200).send("Hello sweetheart!")
});

app.post('/login', function(req, res){

    let payload = {userName: req.body.userName};
    let options = {expiresIn: "10d"};
    const token = authManager.generateToken(payload, options);
    res.status(200).send(token);

});

app.use('/register',function(req,res,next){

    var userName =req.body.userName;
    var password =req.body.password;
    var email =req.body.email;
    var userNameLen =  3 <= userName.length <= 8 ;
    var passwordLen= 5 <= password.length <= 10 ;
    //check username input
    if(!userNameReg.test(userName) || !userName ){
        res.status(500).send("Error in user name");
        return;
    }

    //check password
    if(!passReg.test(password || !password) ){
        res.status(500).send('Weak password! Please enter 5-10 characters, at least one number and one letter.');
        return;
    }

    DButilsAzure.execQuery( "SELECT * "+
                            "FROM users "+
                            "WHERE userName = '"+userName+"'")
    .then(function(result){
        if(result.length > 0 ){
            res.status(500).send({response:"User already exists"});
        }
    })
    .catch(function(err){
        console.log(err);
        res.status(500).send(err);
    })
    next();
});

app.post('/register', function(req, res){
    var fields = "userName, password, firstName, lastName, city, neighborhood, street, email";
    var values = "";
    var count =0;
    for (var param in req.body){
        values+="'"+req.body[param]+"', ";
        count++;
        if(count === 9 ){
            break;
        }
    }
    values = values.substring(0, values.length - 2);
    console.log(values);
    var sql = "INSERT INTO users ("+fields+") VALUES ("+values+");";
    DButilsAzure.execQuery(sql)
        .then(function(result){
            res.status(200).send("User registered successfully");
        })
        .catch(function(err){
            console.log(err);
            //res.status(500).send(err)
        });


});

app.post('/getUserReports', function(req, res){
    var userName = req.body.userName;
    
    DButilsAzure.execQuery( "SELECT * "+
                            "FROM reports "+
                            "WHERE userName = '"+userName+"'")
   .then(function(result){
       if(result.length === 0 ){
            res.status(200).send({response:"User does not exist or does not have any reports"});
       } else {
            res.status(200).send(result);
       }
    })
    .catch(function(err){
        console.log(err);
        res.status(500).send(err);
    })
});

app.get('/getReportImage', function(req, res){
    var userName = req.body.userName;
    var imagePath = req.query.imagePath;

    var options = {
        root: __dirname,
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
    }
    res.sendFile(imagePath, options, function (err) {
        if (err) {
            res.status(500).send(err);
            throw err;
        } else {
            console.log('Sent:', imagePath)
        }
    })
});


app.post('/getNearbyUserReports', function(req, res){
    var userName = req.body.userName;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var time = Date.now() - 1;

    DButilsAzure.execQuery( "SELECT * "+
                            "FROM reports ")
                            // "WHERE date >= '"+time+"'")
   .then(function(result){
       if(result.length === 0 ){
            res.status(200).send({response:"There are no reports from the last day."});
       } else {
            var filteredResult = result.filter(report => calcCrow(latitude, longitude, report.latitude, report.longitude) <= 10)
            res.status(200).send(filteredResult);
       }
    })
    .catch(function(err){
        console.log(err);
        res.status(500).send(err);
    })
});


app.post('/getAllReports', function(req, res){
    DButilsAzure.execQuery( "SELECT userName, date, longitude, latitude, neighborhood, image"+
                            "FROM reports")
   .then(function(result){
           res.status(200).send(result);
    })
    .catch(function(err){
        console.log(err);
        res.status(500).send(err);
    })
});


//CHECK!
app.post('/restorePassword', function(req, res){
    var sql = "SELECT * FROM usersSecurityQuestions WHERE userName= '"+req.body['userName']+
        "' and questionId= "+req.body["questionId"];
    DButilsAzure.execQuery(sql)
        .then(function(result){
            if(result.length === 0)
                res.send(JSON.stringify({response: "user does not exists"}));
            else {
                var user = result[0];
                if(user['answer'] === req.body['answer']){
                    DButilsAzure.execQuery("SELECT * FROM users WHERE userName= '"+req.body['userName']+"'")
                        .then(function (result) {
                            res.status(200).send({password: result[0]['password']});
                        })
                        .catch(function(err){
                            console.log(err);
                            res.status(500).send(err)
                        })
                }
                else
                    res.status(401).send(JSON.stringify({response: "Wrong answer"}))
            }
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err)
        })
});


 //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
 function calcCrow(lat1, lon1, lat2, lon2) 
 {
    var R = 6371; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
 }

 // Converts numeric degrees to radians
 function toRad(Value) 
 {
     return Value * Math.PI / 180;
 }

 module.exports = server
