const twofactor = require("node-2fa");  
var nodemailer = require("nodemailer");

const newSecret = twofactor.generateSecret({ name: "My Awesome App", account: "johndoe" });
/*
{ secret: 'XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W',
  uri: 'otpauth://totp/My%20Awesome%20App:johndoe?secret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W&issuer=My%20Awesome%20App',
  qr: 'https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/My%20Awesome%20App:johndoe%3Fsecret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W%26issuer=My%20Awesome%20App'
}
*/
console.log(newSecret.secret)

const newToken = twofactor.generateToken(newSecret.secret);
console.log(newToken.token)
// => { token: '630618' }

console.log(twofactor.verifyToken(newSecret.secret, newToken.token));
// => { delta: 0 }

console.log(twofactor.verifyToken(newSecret.secret, "00"));
// => null