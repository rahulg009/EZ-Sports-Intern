var mongoose = require("mongoose");
const validator = require('validator')

const eventSchema = new mongoose.Schema({
    room:{
        id:{
            type:mongoose.Schema.Types.ObjectID,
            ref:"Room"
        },
        room_ty:String
    },
    game:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game"
        },
        game_ty:String
    },
    status:{
        type:String,
        default:"Disabled",
        enum:["Active","Disabled"],
        required:true
    },
    startDate:{
        type:Date,
        required:true,
        min:Date.now()
    },
    endDate:{
        type:Date,
        required:true
    },
    roomID:{
        type:String
    },
    password:{
        type:String
    },
    entryFee:{
        type:Number,
        required:true  
    },
    rules:{
        type:String
    },
    prizePool:{
        type:Number
    },
    createdby:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
         },
        username: String
    },
    modifiedby:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
         },
        username: String
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Event", eventSchema);