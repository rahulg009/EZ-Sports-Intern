const twofactor = require("node-2fa");  
var nodemailer = require("nodemailer");

const newSecret = twofactor.generateSecret({ name: "My Awesome App", account: "johndoe" });



const newToken = twofactor.generateToken(newSecret.secret);



// console.log(twofactor.verifyToken(newSecret.secret, newToken.token));


// console.log(twofactor.verifyToken(newSecret.secret, "00"));
// // => null