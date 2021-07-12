const auth = function(req, res, next){
    console.log("User middleware")
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.status(400).send("Please login ")
    }
}

module.exports = auth;