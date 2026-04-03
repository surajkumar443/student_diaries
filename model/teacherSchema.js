const mongoose=require("mongoose");

const teacherSchema=new mongoose.Schema({

    teacherId:{
        type:String,
        required:true,
    },
    name:{

        type:String,
        required:true,

    },
    email:{

        type:String,
        required:true,
        unique:true,

    },
    password:{

        type:String,
        required:true,

    },
    contact:{

        type:String,
        required:true,

    },
    address:{

        type:String,
        required:true,

    },
    qualification:{

        type:String,
        required:true,

    },
    experience:{

        type:String,
        required:true,

    },
    dob:{

        type:String,
        required:true,

    },
    gender:{

        type:String,
        required:true,

    },
    profile:{

        type:String,
        required:true,
    },
    adminVerify:{

        type:"String",
        default:"Not verified"

    },
    status:{

        type:Boolean,
        default:true,

    }

});

const TeacherModel=mongoose.model("teacher", teacherSchema);

module.exports=TeacherModel;