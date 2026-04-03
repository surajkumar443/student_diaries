const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailer = require("./mailer");
const uuid4 = require("uuid4");

const { message, status } = require("../utils/statusMessage");
const AdminLogin = require("../model/adminSchema");
const TeacherModel = require("../model/teacherSchema");
const StudentModel = require("../model/studentSchema");
const ClassModel = require("../model/classSchema");
const ClassAssignModel = require("../model/classAssignToStudentSchema");
const SessionModel = require("../model/sessionSchema");
const AdminModel=require("../model/adminSchema");
const  AnnouncementModel=require("../model/annoucementSchema");

module.exports.adminLogInController = async (req, res) => {
  try {
    let { email, password } = req.body;

    let result = await AdminLogin.findOne({ email: email });
    if (result) {
      let existingPassword = result.password;
      let check = await bcrypt.compare(password, existingPassword);

      if (check) {
        let adminPayload = {
          email:email,
          role: "admin",
        };

        let maxAge = {
          expiresIn: "1h",
        };

        let token = jwt.sign(
          adminPayload,
          process.env.ADMIN_SECRET_KEY,
          maxAge
        );
        res.cookie("admin_jwt", token, {
          httpOnly: true,
          maxAge: 720000 * 60 * 60,
        });
        //res.redirect("/admin/adminHome");
        res.render("adminHome.ejs", { email: email, message: "", status: "" });
      } else {
        res.render("adminLogin.ejs", {
          message: message.WRONG_CREDENTIALS,
          status: status.ERROR,
        });
      }
    } else {
      res.render("adminLogin.ejs", {
        message: message.WRONG_CREDENTIALS,
        status: status.ERROR,
      });
    }
  } catch {
    (err) => {
      console.log(err);
      res.render("adminLogin.ejs", {
        message: message.SOMETHING_WENT_WRONG,
        status: status.ERROR,
      });
    };
  }
};

module.exports.adminHomeController = (req, res) => {
  try {
    res.render("adminHome.ejs", {
      email: req.adminPayload.email,
      message: "",
      status: "",
    });
  } catch {
    (error) => {
      console.log(error);
      res.render("adminLogin", {
        message: message.SOMETHING_WENT_WRONG,
        status: status.SUCCESS,
      });
    };
  }
};

module.exports.adminLogOutController = (req, res) => {
  try {
    res.clearCookie("admin_jwt");
    console.log("LogOut Successfully");
    res.render("adminLogin.ejs", {
      message: message.LOGOUT_SUCCESSFULLY,
      status: status.ERROR,
    });
  } catch (error) {
    console.log("Error in adminLogOut:" + error);
    res.render("adminLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.teacherRegistrationLinkController = async (req, res) => {
  try {
    const teacherEmail = req.body.email;

    // need to manage the concept of mailer
    mailer.mailer(teacherEmail, false, (value) => {
      if (value) {
        console.log("Mail send Successfully");
        res.render("adminHome.ejs", {
          email: req.adminPayload.email,
          message: message.MAIL_SEND,
          status: status.SUCCESS,
        });
      } else {
        console.log("Error during sending of registration mail:", error);
        res.render("adminHome.ejs", {
          email: req.adminPayload.email,
          message: message.MAIL_NOT_SEND,
          status: status.ERROR,
        });
      }
    });
  } catch (error) {
    console.log("Error during the registraction of teacher:", error);
    res.render("adminLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.adminViewTeacherListController = async (req, res) => {
  try {
    const teacherData = await TeacherModel.find();
    res.render("adminViewTeacherList.ejs", {
      email: req.adminPayload.email,
      teacherData: teacherData.reverse(),
      message: "",
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("Error during the admin view of teacherList:", error);
    res.render("adminLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.adminVerifyTeacherController = async (req, res) => {
  try {
    const teacherId = req.body.teacherId;
    const result = await TeacherModel.updateOne(
      { teacherId: teacherId },
      { adminVerify: "Verified" }
    );
    console.log("Teacher Verified successfully !!");

    const teacherData = await TeacherModel.find();
    res.render("adminViewTeacherList.ejs", {
      email: req.adminPayload.email,
      teacherData: teacherData.reverse(),
      message: message.STATUS_VERIFIED,
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("Error during Admin Verify Teacher:", error);
    res.render("adminLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.adminViewStudentListController = async (req, res) => {
  try {
    const studentData = await StudentModel.find();
    res.render("adminViewStudentList.ejs", {
      email: req.adminPayload.email,
      studentData: studentData.reverse(),
      message: "",
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("Error during the admin view of studentList:", error);
    res.render("adminLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.adminVerifyStudentController = async (req, res) => {
  try {
    const studentId = req.body.studentId;
    const result = await StudentModel.updateOne(
      { studentId: studentId },
      { adminVerify: "Verified" }
    );
    console.log("Student Verified successfully !!");

    const studentData = await StudentModel.find();
    res.render("adminViewStudentList.ejs", {
      email: req.adminPayload.email,
      studentData: studentData.reverse(),
      message: message.STATUS_VERIFIED,
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("Error during Admin Verify Student:", error);
    res.render("adminLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.adminAddClassController = async (req, res) => {
  try {
    res.render("adminAddClass.ejs", {
      email: req.adminPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in admin Add Class:", error);
    res.render("adminHome.ejs", {
      email: req.adminPayload.email,
      message: "",
      status: status.ERROR,
    });
  }
};

module.exports.addClassController = async (req, res) => {
  try {
    const class_name = req.body.class_name;
    const section_name = req.body.section_name;
    const checkStatus = {
      $and: [{ class_name }, { section_name }],
    };
    const classStatus = await ClassModel.find(checkStatus);

    if (classStatus.length == 0) {
      const classObj = {
        classId: uuid4(),
        class_name: class_name,
        section_name: section_name,
      };
      await ClassModel.insertOne(classObj)
        .then(() => {
          console.log("class added successfully");
        })
        .catch((error) => {
          console.log("Error during adding of the class:", error);
        });
      res.render("adminAddClass.ejs", {
        email: req.adminPayload.email,
        message: message.CLASS_ADD_SUCCESSFULLY,
        status: status.SUCCESS,
      });
    } else {
      res.render("adminAddClass.ejs", {
        email: req.adminPayload.email,
        message: message.CLASS_ALL_EXIST,
        status: status.ERROR,
      });
    }
  } catch (error) {
    console.log("Error in Add Class:", error);
    res.render("adminAddClass.ejs", {
      email: req.adminPayload.email,
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.adminAssignClassController = async (req, res) => {
  try {
    const classIdData = await ClassModel.find({ status: true });
    const studentIdData = await StudentModel.find({ status: true });
    const teacherIdData = await TeacherModel.find({ status: true });
    const sessionIdData= await SessionModel.find({status:true});

    res.render("adminAssignClass.ejs", {
      classIdData,
      studentIdData,
      teacherIdData,
      sessionIdData,
      email: req.adminPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in admin Assign Class:", error);
    res.render("adminHome.ejs", {
      email: req.adminPayload.email,
      message: "",
      status: status.ERROR,
    });
  }
};

module.exports.assignClassController = async (req, res) => {
  try {
    req.body.classATStudentId = uuid4();
    const classAssign = req.body;

    const checkStatus =await ClassAssignModel.findOne({
      $and: [{ classId: req.body.classId }, { studentId: req.body.studentId }],
    });

    if (checkStatus) {
      res.render("adminAssignClass.ejs", {
        classIdData: "",
        studentIdData: "",
        teacherIdData: "",
        sessionIdData:"",
        email: req.adminPayload.email,
        message: message.CLASS_ALREADY_ASSIGNED,
        status: status.ERROR,
      });
    } else {
      await ClassAssignModel.insertOne(classAssign)
        .then(() => {
          console.log("class assigned successfully");
        })
        .catch((error) => {
          console.log("Error during assign of the class:", error);
        });

      res.render("adminAssignClass.ejs", {
        classIdData: "",
        studentIdData: "",
        teacherIdData: "",
        sessionIdData:"",
        email: req.adminPayload.email,
        message: message.CLASS_ASSIGNED,
        status: status.SUCCESS,
      });
    }
  } catch (error) {
    console.log("Error in Assign Class:", error);
    res.render("adminAssignClass.ejs", {
      classIdData: "",
      studentIdData: "",
      teacherIdData: "",
      sessionIdData:"",
      email: req.adminPayload.email,
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.adminAddSessionController = async (req, res) => {
  try {
    res.render("adminAddSession.ejs", {
      email: req.adminPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in admin Add Session Controller:", error);
    res.render("adminHome.ejs", {
      email: req.adminPayload.email,
      message: "",
      status: status.ERROR,
    });
  }
};

module.exports.addSessionController = async (req, res) => {
  try {
    req.body.sessionId = uuid4();
    const{session}= req.body;
   
    const checkStatus =await SessionModel.findOne({
      session: session,
    });

    if (checkStatus) {
      res.render("adminAddSession.ejs", {
        email: req.adminPayload.email,
        message: message.SESSION_ALREADY_EXIST,
        status: status.ERROR,
      });
    } else {
      await SessionModel.insertOne(req.body)
        .then(() => {
          console.log("session added successfully");
        })
        .catch((error) => {
          console.log("Error during adding of session:", error);
        });
      
      res.render("adminAddSession.ejs", {
        email: req.adminPayload.email,
        message: message.SESSION_ADDED_SUCCESSFULLY,
        status: status.SUCCESS,
      });
    }
  } catch (error) {
    console.log("Error in Add session:", error);
    res.render("adminAddSession.ejs", {
      email: req.adminPayload.email,
      message: message.SESSION_ALREADY_EXIST,
      status: status.ERROR,
    });
  }
};

module.exports.passwordUpdateController = async (req, res) => {
  try {
    res.render("adminUpdatePassword.ejs", {
      email: req.adminPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in update password controller:", error);
    res.render("adminLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.adminUpdatePasswordController = async (req, res) => {
  try {
    const { oldPassword, newPassword, reEnterPassword } = req.body;
    const adminObj = await AdminModel.findOne({
      email: req.adminPayload.email,
    });
    
    let existingPassword = adminObj.password;
    let check = await bcrypt.compare(oldPassword, existingPassword);

    if (check) {
      if (newPassword != reEnterPassword) {
        res.render("adminUpdatePassword.ejs", {
          email: req.adminPayload.email,
          message: message.NEWPASSWORD_NOT_EQUAL,
          status: status.ERROR,
        });
      } else {
        let hashPassword = await bcrypt.hash(newPassword, 10);
        await AdminModel.findOneAndUpdate(
          { email: adminObj.email },
          { password: hashPassword },
          { runValidators: true }
        )
          .then(() => {
            console.log("Admin password update successfully");
          })
          .catch((error) => {
            console.log("Error while saving the password:", error);
          });

        res.render("adminLogin.ejs", {
          message: message.PASSWORD_UPDATE_SUCCESSFULLY,
          status: status.SUCCESS,
        });
      }
    } else {
      res.render("adminUpdatePassword.ejs", {
        email: req.adminPayload.email,
        message: message.INVALID_OLD_CREDENTIALS,
        status: status.ERROR,
      });
    }
  } catch (error) {
    console.log("Error in admin update password controller:", error);
    res.render("adminLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.adminViewAnnouncementController=async(req, res)=>{

  try{

    const announcementData=await AnnouncementModel.find();
    res.render("adminViewAnnouncement.ejs", {
      finalDataArray:announcementData.reverse(),
      email:req.adminPayload.email,
      message:"",
      status:"",
    });

  }
  catch(error){

    console.log("Error in admin view announcement:", error);
    res.render("adminLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
}
