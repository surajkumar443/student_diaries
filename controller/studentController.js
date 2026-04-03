const path = require("path");
const jwt = require("jsonwebtoken");
const uuid4 = require("uuid4");
const bcrypt = require("bcrypt");
//const expressFileUpload=require("express-fileupload");
//const {fileURLToPath}= require("url");
//const {mv} =require("url");

const { message, status } = require("../utils/statusMessage");
const StudentModel = require("../model/studentSchema");
const ClassAssignModel = require("../model/classAssignToStudentSchema");
const AnnouncementModel = require("../model/annoucementSchema");
const MealModel = require("../model/mealSchema");
const TimeTableModel = require("../model/timeTableSchema");
const AssignmentModel = require("../model/assignmentSchema");

module.exports.addStudentController = async (req, res) => {
  try {
    const filename = req.files.profile;
    const studentData = req.body;
    // const __filename=fileURLToPath(import.meta.url);
    // const __dirname=path.dirname(__filename);

    const fileName = new Date().getTime() + filename.name;
    const pathName = path.join(
      __dirname.replace("\\controller", "") +
        "/public/studentProfile/" +
        fileName
    );

    filename.mv(pathName, async (error) => {
      if (error) {
        console.log("Error while dealing with student profile pic:", error);
        res.render("index.ejs");
      } else {
        req.body.studentId = uuid4();
        req.body.profile = fileName;
        req.body.password = await bcrypt.hash(req.body.password, 10);
        const result = await new StudentModel(studentData);
        result
          .save()
          .then((res) => {
            console.log("Student data saved successfully");
          })
          .catch((error) => {
            console.log("Error during saving data at database:", error);
          });

        res.render("studentLogin.ejs", {
          message: message.ADMIN_NOT_VERIFIED_YET,
          status: status.SUCCESS,
        });
      }
    });
  } catch (error) {
    console.log("Error during add Student:", error);
    res.render("index.ejs", { message: "", status: "" });
  }
};

module.exports.studentLoginController = async (req, res) => {
  try {
    res.render("studentLogin.ejs", { message: "", status: "" });
  } catch (error) {
    console.log("Error in student Login:", error);
    res.render("studentLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.loginStudentController = async (req, res) => {
  try {
    let { email, password } = req.body;
    let studentObj = await StudentModel.findOne({ email: email });

    if (studentObj) {
      if (studentObj.adminVerify === "Verified") {
        let existingPassword = studentObj.password;
        let check = await bcrypt.compare(password, existingPassword);
        const studentStatus = studentObj.status;
        if (check && studentStatus) {
          let studentPayload = {
            email: email,
            role: "student",
          };

          let maxAge = {
            expiresIn: "1h",
          };

          let token = jwt.sign(
            studentPayload,
            process.env.STUDENT_SECRET_KEY,
            maxAge
          );
          res.cookie("student_jwt", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
          });

          //logic of announcement display

          const studentObj = await StudentModel.findOne({
            email: email,
          });
          const studentId = studentObj.studentId;
          const studentDataArray = await ClassAssignModel.find({
            studentId: studentId,
          });
          const announcementDataArray = await AnnouncementModel.find();
          let finalDataArray = [];
          if (
            studentDataArray.length != 0 &&
            announcementDataArray.length != 0
          ) {
            for (let i = 0; i < studentDataArray.length; i++) {
              const check = {
                $and: [
                  { teacherId: studentDataArray[i].teacherId },
                  { classId: studentDataArray[i].classId },
                  { currentSession: studentDataArray[i].currentSession },
                ],
              };

              const data = await AnnouncementModel.find(check);
              finalDataArray.push(data);
            }
            res.render("studentHome.ejs", {
              finalDataArray: finalDataArray.flat(),
              email: email,
              message: "",
              status: "",
            });
          } else {
            res.render("studentHome.ejs", {
              finalDataArray: finalDataArray.flat(),
              email: email,
              message: "",
              status: "",
            });
          }
        } else {
          res.render("studentLogin.ejs", {
            message: message.WRONG_CREDENTIALS,
            status: status.ERROR,
          });
        }
      } else {
        res.render("studentLogin.ejs", {
          message: message.ADMIN_NOT_VERIFIED_YET,
          status: status.ERROR,
        });
      }
    } else {
      res.render("studentLogin.ejs", {
        message: message.WRONG_CREDENTIALS,
        status: status.ERROR,
      });
    }
  } catch (error) {
    console.log("Error in during login student:", error);
    res.render("studentLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.studentHomeController = async (req, res) => {
  try {
    const studentObj = await StudentModel.findOne({
      email: req.studentPayload.email,
    });
    const studentId = studentObj.studentId;
    const studentDataArray = await ClassAssignModel.find({
      studentId: studentId,
    });
    const announcementDataArray = await AnnouncementModel.find();
    let finalDataArray = [];
    if (studentDataArray.length != 0 && announcementDataArray.length != 0) {
      for (let i = 0; i < studentDataArray.length; i++) {
        const check = {
          $and: [
            { teacherId: studentDataArray[i].teacherId },
            { classId: studentDataArray[i].classId },
            { currentSession: studentDataArray[i].currentSession },
          ],
        };

        const data = await AnnouncementModel.find(check);
        finalDataArray.push(data);
      }
      res.render("studentHome.ejs", {
        finalDataArray: finalDataArray.flat().reverse(),
        email: req.studentPayload.email,
        message: "",
        status: "",
      });
    } else {
      res.render("studentHome.ejs", {
        finalDataArray: finalDataArray.flat().reverse(),
        email: req.studentPayload.email,
        message: "",
        status: "",
      });
    }
  } catch {
    (error) => {
      console.log("Error in student home controller", error);
      res.render("studentLogin.ejs", {
        message: message.SOMETHING_WENT_WRONG,
        status: status.ERROR,
      });
    };
  }
};

module.exports.viewMealController = async (req, res) => {
  try {
    const studentObj = await StudentModel.findOne({
      email: req.studentPayload.email,
    });
    const studentId = studentObj.studentId;
    const classAtsObj = await ClassAssignModel.findOne({
      studentId: studentId,
    });
    const checkStatus = {
      $and: [
        { classId: classAtsObj.classId },
        { teacherId: classAtsObj.teacherId },
        { currentSession: classAtsObj.currentSession },
      ],
    };
    const mealArray = await MealModel.find(checkStatus);
    res.render("viewMealMenu.ejs", {
      mealArray,
      email: req.studentPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in view meal controller", error);
    res.render("studentLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.viewTimeTableController = async (req, res) => {
  try {
    const studentObj = await StudentModel.findOne({
      email: req.studentPayload.email,
    });
    const studentId = studentObj.studentId;
    const classAtsObj = await ClassAssignModel.findOne({
      studentId: studentId,
    });
    const checkStatus = {
      $and: [
        { classId: classAtsObj.classId },
        { teacherId: classAtsObj.teacherId },
        { currentSession: classAtsObj.currentSession },
      ],
    };
    const timeTableArray = await TimeTableModel.find(checkStatus);
    res.render("viewTimeTable.ejs", {
      timeTableArray,
      email: req.studentPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in view time table controller", error);
    res.render("studentLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.viewAssignmentController = async (req, res) => {
  try {
    const studentObj = await StudentModel.findOne({
      email: req.studentPayload.email,
    });
    const studentId = studentObj.studentId;
    const classAtsObj = await ClassAssignModel.findOne({
      studentId: studentId,
    });
    const checkStatus = {
      $and: [
        { classId: classAtsObj.classId },
        { teacherId: classAtsObj.teacherId },
        { currentSession: classAtsObj.currentSession },
      ],
    };
    const assignmentArray = await AssignmentModel.find(checkStatus);
    res.render("viewAssignment.ejs", {
      assignmentArray,
      email: req.studentPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in view assignment controller", error);
    res.render("studentLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.studentLogOutController = async (req, res) => {
  try {
    res.clearCookie("student_jwt");
    console.log("Student logout successfully");
    res.render("studentLogin.ejs", {
      message: message.LOGOUT_SUCCESSFULLY,
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("Error in student logout controller:", error);
    res.render("studentLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.passwordUpdateController = async (req, res) => {
  try {
    res.render("studentUpdatePassword.ejs", {
      email: req.studentPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in student update password controller:", error);
    res.render("studentLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.studentUpdatePasswordController = async (req, res) => {
  try {
    const { oldPassword, newPassword, reEnterPassword } = req.body;
    const studentObj = await StudentModel.findOne({
      email: req.studentPayload.email,
    });

    let existingPassword = studentObj.password;
    let check = await bcrypt.compare(oldPassword, existingPassword);

    if (check) {
      if (newPassword != reEnterPassword) {
        res.render("studentUpdatePassword.ejs", {
          email: req.studentPayload.email,
          message: message.NEWPASSWORD_NOT_EQUAL,
          status: status.ERROR,
        });
      } else {
        let hashPassword = await bcrypt.hash(newPassword, 10);
        await StudentModel.findOneAndUpdate(
          { studentId: studentObj.studentId },
          { password: hashPassword },
          { runValidators: true }
        )
          .then(() => {
            console.log("Student password update successfully");
          })
          .catch((error) => {
            console.log("Error while saving the password:", error);
          });

        res.render("studentLogin.ejs", {
          message: message.PASSWORD_UPDATE_SUCCESSFULLY,
          status: status.SUCCESS,
        });
      }
    } else {
      res.render("studentUpdatePassword.ejs", {
        email: req.studentPayload.email,
        message: message.INVALID_OLD_CREDENTIALS,
        status: status.ERROR,
      });
    }
  } catch (error) {
    console.log("Error in student update password controller:", error);
    res.render("studentLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.viewProfileController = async (req, res) => {
  try {
    const studentObj = await StudentModel.findOne({
      email: req.studentPayload.email,
    });

    res.render("viewStudentProfile.ejs", {
      studentData: studentObj,
      message: "",
      status: "",
    });
    
  } catch (error) {
    console.log("Error in student view profile controller:", error);
    res.render("studentLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
