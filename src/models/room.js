var mongoose = require("mongoose");
const validator = require('validator')

const roomSchema = new mongoose.Schema({
    room:{
        type: String,
        required:true
    },
    game:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game"
        },
        game_ty:String
    },
    map:{
        type:String,
        required:true
    },
    roommode:{
        type:String,
        required:true
    },
    squadtype:{
        type:String,
        required:true
    },
    platform:{
        type:String
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

module.exports = mongoose.model("Room", roomSchema);