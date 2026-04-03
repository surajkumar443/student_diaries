const mongoose=require("mongoose");

const sessionSchema=new mongoose.Schema({

    sessionId:{
        type:String,
        required:true
    },
    session:{
        type:String,
        required:true
    },
    status:{

        type:Boolean,
        default:true,
    }

});

const SessionModel=mongoose.model("session", sessionSchema);

module.exports=SessionModel;