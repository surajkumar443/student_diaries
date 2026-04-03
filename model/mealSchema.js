const mongoose=require("mongoose");

const mealSchema=new mongoose.Schema({

    mealId:{
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
    menuDoc:{

        type:String,
        required:true,
    },
    status:{

        type:String,
        default:true,
    },
});

const MealModel=mongoose.model("meal", mealSchema);

module.exports=MealModel;