const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid4 = require("uuid4");
const mailer = require("../controller/mailer.js");
const path = require("path");

const { message, status } = require("../utils/statusMessage");
const TeacherModel = require("../model/teacherSchema");
const ClassAssignModel = require("../model/classAssignToStudentSchema.js");
const SessionModel = require("../model/sessionSchema.js");
const ClassModel = require("../model/classSchema.js");
const StudentModel = require("../model/studentSchema.js");
const AnnouncementModel = require("../model/annoucementSchema.js");
const MealModel = require("../model/mealSchema.js");
const TimeTableModel = require("../model/timeTableSchema.js");
const AssignmentModel = require("../model/assignmentSchema.js");

module.exports.teacherRegistrationDataController = async (req, res) => {
  
  try {
    const filename = req.files.profile;
    const fileName = new Date().getTime() + filename.name;
    const pathName = path.join(
      __dirname.replace("\\controller", "") +
        "/public/teacherProfile/" +
        fileName
    );

    filename.mv(pathName, async (error) => {
      if (error) {

        console.log("Error while dealing with teacher profile pic:", error);
        res.render("index.ejs");

      } else {

        req.body.teacherId = uuid4();
        req.body.password = await bcrypt.hash(req.body.password, 10);
        req.body.profile = fileName;
        const teacherData = req.body;
        const addTeacherData = new TeacherModel(teacherData);
        addTeacherData
          .save()
          .then((res) => {
            console.log("Teacher data is saved");
          })
          .catch((error) => {
            console.log("Error during add teacher data:", error);
          });
        res.render("teacherLogin.ejs", {
          message: message.ADMIN_APPROVAL,
          status: status.SUCCESS,
        });

      }
    });
  } catch (error) {

    console.log("Error in teacher registration contoller:", error);
    res.render("index.ejs");
  }
};

module.exports.teacherLoginController = async (req, res) => {
  try {
    res.render("teacherLogin.ejs", { message: "", status: "" });
  } catch (error) {
    console.log("Error in tecaher Login:", error);
    res.render("techerLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.loginTeacherController = async (req, res) => {
  try {
    let { email, password } = req.body;
    let teacherObj = await TeacherModel.findOne({ email: email });

    if (teacherObj) {
      if (teacherObj.adminVerify === "Verified") {
        let existingPassword = teacherObj.password;
        let check = await bcrypt.compare(password, existingPassword);
        const teacherStatus = teacherObj.status;
        if (check && teacherStatus) {
          let teacherPayload = {
            email: email,
            role: "teacher",
          };

          let maxAge = {
            expiresIn: "1h",
          };

          let token = jwt.sign(
            teacherPayload,
            process.env.TEACHER_SECRET_KEY,
            maxAge
          );
          res.cookie("teacher_jwt", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
          });

          res.render("teacherHome.ejs", {
            email: email,
            message: "",
            status: "",
          });
        } else {
          res.render("teacherLogin.ejs", {
            message: message.WRONG_CREDENTIALS,
            status: status.ERROR,
          });
        }
      } else {
        res.render("teacherLogin.ejs", {
          message: message.ADMIN_NOT_VERIFIED_YET,
          status: status.ERROR,
        });
      }
    } else {
      res.render("teacherLogin.ejs", {
        message: message.WRONG_CREDENTIALS,
        status: status.ERROR,
      });
    }
  } catch (error) {
    console.log("Error in during login teacher:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.teacherHomeController = (req, res) => {
  try {
    res.render("teacherHome.ejs", {
      email: req.teacherPayload.email,
      message: "",
      status: "",
    });
  } catch {
    (error) => {
      console.log("Error in teacher home controller", error);
      res.render("teacherLogin", {
        message: message.SOMETHING_WENT_WRONG,
        status: status.SUCCESS,
      });
    };
  }
};

module.exports.studentRegistrationLinkController = async (req, res) => {
  try {
    const studentEmail = req.body.email;

    // need to manage the concept of mailer
    mailer.mailer(studentEmail, true, (value) => {
      if (value) {
        console.log("Mail send Successfully");
        res.render("teacherHome.ejs", {
          email: req.teacherPayload.email,
          message: message.MAIL_SEND,
          status: status.SUCCESS,
        });
      } else {
        console.log("Error during sending of registration mail:", error);
        res.render("teacherHome.ejs", {
          email: req.teacherPayload.email,
          message: message.MAIL_NOT_SEND,
          status: status.ERROR,
        });
      }
    });
  } catch (error) {
    console.log("Error during the registraction of student:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.classAssignedController = async (req, res) => {
  try {
    const sessionData = await SessionModel.find();
    res.render("selectSession.ejs", {
      sessionData: sessionData,
      email: req.teacherPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in class assigned controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.sessionStudentDataController = async (req, res) => {
  try {
    const currentSession = req.body.currentSession;
    const teacherObj = await TeacherModel.findOne({
      email: req.teacherPayload.email,
    });

    const teacherId = teacherObj.teacherId;
    const classStudentData = await ClassAssignModel.find({
      $and: [{ teacherId: teacherId }, { currentSession: currentSession }],
    }).lean();

    for (let i = 0; i < classStudentData.length; i++) {
      const classObj = await ClassModel.findOne({
        classId: classStudentData[i].classId,
      });
      const teacherObj = await TeacherModel.findOne({
        teacherId: classStudentData[i].teacherId,
      });
      const studentObj = await StudentModel.findOne({
        studentId: classStudentData[i].studentId,
      });

      classStudentData[i].className = classObj.class_name;
      classStudentData[i].sectionName = classObj.section_name;
      classStudentData[i].teacherName = teacherObj.name;
      classStudentData[i].studentName = studentObj.name;
    }

    res.render("teacherViewStudents.ejs", {
      classStudentData: classStudentData.reverse(),
      email: req.teacherPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in session student data controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.announcementController = async (req, res) => {
  try {
    const teacherObj = await TeacherModel.findOne({
      email: req.teacherPayload.email,
    });
    const classStudentArray = await ClassAssignModel.find({
      teacherId: teacherObj.teacherId,
    }).lean();

    for (let i = 0; i < classStudentArray.length; i++) {
      classStudentArray[i].teacherName = teacherObj.name;
      const classObj = await ClassModel.findOne({
        classId: classStudentArray[i].classId,
      });
      classStudentArray[i].className = classObj.class_name;
      classStudentArray[i].sectionName = classObj.section_name;
    }

    res.render("announcement.ejs", {
      classStudentArray: classStudentArray.reverse(),
      email: req.teacherPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in announcement controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.addAnnouncementController = async (req, res) => {
  try {
    const announcementData = JSON.parse(req.body.announcementData);
    res.render("announcementForm.ejs", {
      announcementData: announcementData,
      email: req.teacherPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in add announcement controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.addAnnouncementDataController = async (req, res) => {
  try {
    req.body.announcementId = uuid4();
    const result = new AnnouncementModel(req.body);
    result
      .save()
      .then(() => {
        console.log("Announcement data saved successfully");
      })
      .catch((error) => {
        console.log("Error while saving announcement data:", error);
      });

    const teacherObj = await TeacherModel.findOne({
      email: req.teacherPayload.email,
    });
    const classStudentArray = await ClassAssignModel.find({
      teacherId: teacherObj.teacherId,
    }).lean();

    for (let i = 0; i < classStudentArray.length; i++) {
      classStudentArray[i].teacherName = teacherObj.name;
      const classObj = await ClassModel.findOne({
        classId: classStudentArray[i].classId,
      });
      classStudentArray[i].className = classObj.class_name;
      classStudentArray[i].sectionName = classObj.section_name;
    }

    res.render("announcement.ejs", {
      classStudentArray: classStudentArray.reverse(),
      email: req.teacherPayload.email,
      message: message.ANNOUNCEMENT_POSTED,
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("Error in add announcement data controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.addMealMenuController = async (req, res) => {
  try {
    const mealData = JSON.parse(req.body.data);
    mealData.mealId = uuid4();

    const filename = req.files.menuDoc;
    const fileName = new Date().getTime() + filename.name;
    mealData.menuDoc = fileName;
    const pathName = path.join(
      __dirname.replace("\\controller", ""),
      "/public/mealMenu/" + fileName
    );
    filename.mv(pathName, async (error) => {
      if (error) {
        console.log("Error in adding meal menu:", error);
      } else {
        await MealModel.insertOne(mealData)
          .then(() => {
            console.log("Meal Menu saved successfully");
          })
          .catch((error) => {
            console.log("Error while saving the meal menu:", error);
          });
      }

      res.render("teacherHome.ejs", {
        email: req.teacherPayload.email,
        message: message.MEAL_ADDED_SUCCESSFULLY,
        status: status.SUCCESS,
      });
    });
  } catch (error) {
    console.log("Error in add meal menu controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.addTimeTableController = async (req, res) => {
  try {
    const timeTableData = JSON.parse(req.body.data);
    timeTableData.timeTableId = uuid4();
    timeTableData.mode = req.body.mode;

    const filename = req.files.timeTableDoc;
    const fileName = new Date().getTime() + filename.name;
    timeTableData.timeTableDoc = fileName;
    const pathName = path.join(
      __dirname.replace("\\controller", ""),
      "/public/timeTable/" + fileName
    );
    filename.mv(pathName, async (error) => {
      if (error) {
        console.log("Error in adding meal menu:", error);
      } else {
        await TimeTableModel.insertOne(timeTableData)
          .then(() => {
            console.log("Time Table saved successfully");
          })
          .catch((error) => {
            console.log("Error while saving the Time Table:", error);
          });
      }

      res.render("teacherHome.ejs", {
        email: req.teacherPayload.email,
        message: message.TIME_TABLE_ADDED_SUCCESSFULLY,
        status: status.SUCCESS,
      });
    });
  } catch (error) {
    console.log("Error in add time table controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.addAssignmentController = async (req, res) => {
  try {
    const assignmentData = JSON.parse(req.body.data);
    assignmentData.assignmentId = uuid4();
    assignmentData.assignmentSubject = req.body.assignmentSubject;

    const filename = req.files.assignmentDoc;
    const fileName = new Date().getTime() + filename.name;
    assignmentData.assignmentDoc = fileName;
    const pathName = path.join(
      __dirname.replace("\\controller", ""),
      "/public/assignment/" + fileName
    );
    filename.mv(pathName, async (error) => {
      if (error) {
        console.log("Error in adding assignment:", error);
      } else {
        await AssignmentModel.insertOne(assignmentData)
          .then(() => {
            console.log("Assignment saved successfully");
          })
          .catch((error) => {
            console.log("Error while saving the assignment:", error);
          });
      }

      res.render("teacherHome.ejs", {
        email: req.teacherPayload.email,
        message: message.ASSIGNMENT_ADDED_SUCCESSFULLY,
        status: status.SUCCESS,
      });
    });
  } catch (error) {
    console.log("Error in add assignment controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.teacherLogOutController = async (req, res) => {
  try {
    res.clearCookie("teacher_jwt");
    console.log("Teacher logout successfully");
    res.render("teacherLogin.ejs", {
      message: message.LOGOUT_SUCCESSFULLY,
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("Error in teacherLogout Controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.passwordUpdateController = async (req, res) => {
  try {
    res.render("teacherUpdatePassword.ejs", {
      email: req.teacherPayload.email,
      message: "",
      status: "",
    });
  } catch (error) {
    console.log("Error in teacher update password controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.teacherUpdatePasswordController = async (req, res) => {
  try {
    const { oldPassword, newPassword, reEnterPassword } = req.body;
    const teacherObj = await TeacherModel.findOne({
      email: req.teacherPayload.email,
    });

    let existingPassword = teacherObj.password;
    let check = await bcrypt.compare(oldPassword, existingPassword);

    if (check) {
      if (newPassword != reEnterPassword) {
        res.render("teacherUpdatePassword.ejs", {
          email: req.teacherPayload.email,
          message: message.NEWPASSWORD_NOT_EQUAL,
          status: status.ERROR,
        });
      } else {
        let hashPassword = await bcrypt.hash(newPassword, 10);
        await TeacherModel.findOneAndUpdate(
          { teacherId: teacherObj.teacherId },
          { password: hashPassword },
          { runValidators: true }
        )
          .then(() => {
            console.log("Teacher password update successfully");
          })
          .catch((error) => {
            console.log("Error while saving the password:", error);
          });

        res.render("teacherLogin.ejs", {
          message: message.PASSWORD_UPDATE_SUCCESSFULLY,
          status: status.SUCCESS,
        });
      }
    } else {
      res.render("teacherUpdatePassword.ejs", {
        email: req.teacherPayload.email,
        message: message.INVALID_OLD_CREDENTIALS,
        status: status.ERROR,
      });
    }
  } catch (error) {
    console.log("Error in teacher update password controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

module.exports.viewProfileController = async (req, res) => {
  try {
    const teacherObj = await TeacherModel.findOne({
      email: req.teacherPayload.email,
    });

    res.render("viewTeacherProfile.ejs", {
      teacherData: teacherObj,
      message: "",
      status: "",
    });
    
  } catch (error) {
    console.log("Error in teacher view profile controller:", error);
    res.render("teacherLogin.ejs", {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
