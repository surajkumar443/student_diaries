const mongoose=require("mongoose");
const moment=require("moment");

const announcementSchema=new mongoose.Schema({

    announcementId:{
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
    currentSession:{

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
    subject:{

        type:String,
        required:true,
    },
    message:{

        type:String,
        required:true,
    },
    time:{

        type:String,
        default:()=>moment().format("hh:mm:ss A"),
    },
    date:{

        type:String,
        default:()=>moment().format("DD/MM/YYYY"),
    },
    status:{

        type:String,
        default:true,
    },

});

const AnnouncementModel=mongoose.model("announcement", announcementSchema);

module.exports=AnnouncementModel;

