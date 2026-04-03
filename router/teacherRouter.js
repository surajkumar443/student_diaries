const express = require("express");
const router = express.Router();
const jwt=require("jsonwebtoken");

const{message,status}=require("../utils/statusMessage.js");
const {
  teacherRegistrationDataController,
  teacherLoginController,
  loginTeacherController,
  teacherHomeController,
  studentRegistrationLinkController,
  classAssignedController,
  sessionStudentDataController,
  announcementController,
  addAnnouncementController,
  addAnnouncementDataController,
  addMealMenuController,
  addTimeTableController,
  addAssignmentController,
  teacherLogOutController,
  passwordUpdateController,
  teacherUpdatePasswordController,
  viewProfileController,
} = require("../controller/teacherContoller.js");

// route for the teacherlogin setup

const authenticateJwt = (req, res, next) => {
  try {
    const token = req.cookies.teacher_jwt;
    if (!token) {
      console.log("Token not found");
      res.render("teacherLogin.ejs", {
        message: message.AUTHENTICATE_ERROR,
        status: status.ERROR,
      });
    } else {
      jwt.verify(token, process.env.TEACHER_SECRET_KEY, (error, payload) => {
        if (error) {
          console.log("Error while verifying token:", error);
          res.render("teacherLogin.ejs", {
            message: message.JWT_VERIFYING_ERROR,
            status: status.ERROR,
          });
        } else {
          req.teacherPayload = payload;
          next();
        }
      });
    }
  } catch {
    (error) => {
      console.log("Error form autheticate teacher:", error);
      res.render(
        "teacherLogin.ejs",
        (message = message.SOMETHING_WENT_WRONG),
        (status = status.ERROR)
      );
    };
  }
};

const authorizeJwt = (req, res, next) => {
  try {
    if (req.teacherPayload.role === "teacher") {
      next();
    } else {
      console.log("Error inside authorize jwt");
      res.render("teacherLogin.ejs", {
        message: message.AUTHORIZE_ERROR,
        status: status.ERROR,
      });
    }
  } catch {
    (error) => {
      console.log("Error inside authorize:", error);
      res.render("teacherLogin.ejs", {
        message: message.AUTHORIZE_ERROR,
        status: status.ERROR,
      });
    };
  }
};

router.post("/teacherRegistration", (req, res) => {
  try {
    const email=req.body.email;
    res.render("teacherRegistration.ejs",{email:email});
  } catch (error) {
    console.log("Error in providing registration form:", error);
    res.render("index.ejs");
  }
});

router.post("/teacherRegistrationData", teacherRegistrationDataController);
router.get("/teacherLogin", teacherLoginController);
router.post("/teacherLogin", loginTeacherController);
router.get(
  "/teacherHome",
  authenticateJwt,
  authorizeJwt,
  teacherHomeController
);
router.post("/studentRegistrationLink", authenticateJwt, studentRegistrationLinkController);
router.get("/classAssigned", authenticateJwt, classAssignedController);
router.post("/sessionStudentData", authenticateJwt, sessionStudentDataController);
router.get("/announcement", authenticateJwt, announcementController);
router.post("/addAnnouncement", authenticateJwt, addAnnouncementController);
router.post("/addAnnouncementData", authenticateJwt, addAnnouncementDataController);
router.post("/addMealMenu", authenticateJwt, addMealMenuController);
router.post("/addTimeTable", authenticateJwt, addTimeTableController);
router.post("/addAssignment", authenticateJwt, addAssignmentController);
router.get("/teacherLogOut", authenticateJwt, teacherLogOutController);
router.get("/passwordUpdate", authenticateJwt, passwordUpdateController);
router.post("/teacherUpdatePassword", authenticateJwt, teacherUpdatePasswordController);
router.get("/viewProfile", authenticateJwt, viewProfileController);

module.exports = router;
