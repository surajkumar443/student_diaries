const mongoose=require("mongoose");
const moment=require("moment");

const assignmentSchema=new mongoose.Schema({

    assignmentId:{

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
    currentSession:{

        type:String,
        required:true,
    },
    assignmentSubject:{

        type:String,
        required:true,
    },
    assignmentDoc:{

        type:String,
        required:true,
    },
    assignmentUploadDate:{

        type:String,
        default:()=>{return moment().format("DD/MM/YYYY")},
    },
    assignmentUploadTime:{

        type:String,
        default:()=>{return moment().format("hh:mm:ss A")},
    },
    status:{

        type:String,
        default:true,
    },

});

const AssignmentModel=mongoose.model("assignment", assignmentSchema);

module.exports= AssignmentModel;