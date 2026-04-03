const mongoose=require("mongoose");

const classAssignSchema=new mongoose.Schema({

    classATStudentId:{

        type:String,
        required:true,
    },
    classId:{

        type:String,
        required:true,

    },
    teacherId:{

        type:String,
        required:true,
    },
    studentId:{

        type:String,
        required:true,

    },
    pickUpDrop:{

        type:String,
        required:true,
    },
    schoolTiming:{

        type:String,
        required:true,
    },
    currentSession:{

        type:String,
        required:true,
    },
    status:{

        type:Boolean,
        default:true,
    }

});

const ClassAssignModel=mongoose.model("classAssign", classAssignSchema);

module.exports=ClassAssignModel;