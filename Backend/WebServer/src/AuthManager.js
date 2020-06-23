const jwt = require("jsonwebtoken");


var secret = "NetaDaniSuperSecretSHHHHHHHHHH!!!!";


exports.generateToken = function(payload, options){

    return jwt.sign(payload,secret, options)
};

exports.validate = function(req, res, next){
    const token = req.header("authrization");
    // no token
    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
        req.body['userName'] = decoded['userName'];
        next();
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
};


