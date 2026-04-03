const mongoose=require("mongoose");

const timeTableSchema=new mongoose.Schema({

    timeTableId:{
        type:String,
        required:true,
    },
    classId:{

        type:String,
        required:true,
    },
    className:{

        type:String,
        required:true,
    },
    teacherId:{

        type:String,
        required:true,
    },
    teacherName:{

        type:String,
        required:true,
    },
    mode:{

        type:String,
        required:true,
    },
    currentSession:{

        type:String,
        required:true,
    },
    timeTableDoc:{

        type:String,
        required:true,
    },
    status:{

        type:String,
        default:true,
    },
});

const TimeTableModel=mongoose.model("timeTable", timeTableSchema);

module.exports=TimeTableModel;