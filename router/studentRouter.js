const express = require("express");
const router = express.Router();
const jwt=require("jsonwebtoken");

const { message, status } = require("../utils/statusMessage.js");
const {
  addStudentController,
  studentLoginController,
  loginStudentController,
  studentHomeController,
  viewMealController,
  viewTimeTableController,
  viewAssignmentController,
  studentLogOutController,
  passwordUpdateController,
  studentUpdatePasswordController,
  viewProfileController,
  
} = require("../controller/studentController.js");

// route for the student login setup

const authenticateJwt = (req, res, next) => {
  try {
    const token = req.cookies.student_jwt;
    if (!token) {
      console.log("Token not found");
      res.render("studentLogin.ejs", {
        message: message.AUTHENTICATE_ERROR,
        status: status.ERROR,
      });
    } else {
      jwt.verify(token, process.env.STUDENT_SECRET_KEY, (error, payload) => {
        if (error) {
          console.log("Error while verifying token:", error);
          res.render("studentLogin.ejs", {
            message: message.JWT_VERIFYING_ERROR,
            status: status.ERROR,
          });
        } else {
          req.studentPayload = payload;
          next();
        }
      });
    }
  } catch {
    (error) => {
      console.log("Error form autheticate student:", error);
      res.render(
        "studentLogin.ejs", {
        message:message.SOMETHING_WENT_WRONG,
        status:status.ERROR,
      });
    };
  }
};

const authorizeJwt = (req, res, next) => {
  try {
    if (req.studentPayload.role ==="student") {
      next();
    } else {
      console.log("Error inside authorize jwt");
      res.render("studentLogin.ejs", {
        message: message.AUTHORIZE_ERROR,
        status: status.ERROR,
      });
    }
  } catch {
    (error) => {
      console.log("Error inside authorize:", error);
      res.render("studentLogin.ejs", {
        message: message.AUTHORIZE_ERROR,
        status: status.ERROR,
      });
    };
  }
};

router.post("/studentRegistration", (req, res) => {
  try {
    const email = req.body.email;
    res.render("studentRegistration.ejs", { email: email });
  } catch (error) {
    console.log("Error in providing registration form:", error);
    res.render("index.ejs");
  }
});

router.post("/addStudent", addStudentController);
router.get("/studentLogin", studentLoginController);
router.post("/studentLogin", loginStudentController);
router.get(
  "/studentHome",
  authenticateJwt,
  authorizeJwt,
  studentHomeController
);
router.get("/viewMeal", authenticateJwt, viewMealController);
router.get("/viewTimeTable", authenticateJwt, viewTimeTableController);
router.get("/viewAssignment", authenticateJwt, viewAssignmentController);
router.get("/studentLogOut", authenticateJwt, studentLogOutController);
router.get("/passwordUpdate", authenticateJwt, passwordUpdateController);
router.post("/studentUpdatePassword", authenticateJwt, studentUpdatePasswordController);
router.get("/viewProfile", authenticateJwt, viewProfileController);

module.exports = router;
