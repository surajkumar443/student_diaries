const mongoose=require("mongoose");

const classSchema=new mongoose.Schema({

    classId:{

        type:String,
        required:true,
    },
    class_name:{

        type:String,
        required:true,
    },
    section_name:{

        type:String,
       required:true,
    },
    status:{

        type:Boolean,
        default:true,
    }
});

const ClassModel=mongoose.model("class", classSchema);

module.exports=ClassModel;