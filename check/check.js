const express = require('express')

const messagebird = require('messagebird')('uGwnz8uCWYm1tr214CyKVzrEf')


const app = express()
const port = process.env.PORT || 3000
app.use(express.json())



app.post('/step2',function(req,res){
    var number = req.body.number;

    messagebird.verify.create(number,{
        originator:'Code',
        template:"Your verification is %token"
      
    },function(err,response){
        if(err){
            console.log(err);
        }
        else{
            
            console.log(response)
        }
    })
    // res.status(200).send()
});

app.post('/step3',function(req,res){
    var id = req.body.id
    var token = req.body.token

    messagebird.verify.verify(id,token,function(err,res){
        if(err){
            console.log(err)
        }else{
            console.log("success")
        }
    })
    // res.send()
})
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

