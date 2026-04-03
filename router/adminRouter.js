const express = require("express");
const router = express.Router({ mergeParams: true });
const { message, status } = require("../utils/statusMessage");
const jwt = require("jsonwebtoken");

const {
  adminLogInController,
  adminHomeController,
  adminLogOutController,
  teacherRegistrationLinkController,
  adminViewTeacherListController,
  adminVerifyTeacherController,
  adminViewStudentListController,
  adminVerifyStudentController,
  adminAddClassController,
  addClassController,
  adminAssignClassController,
  assignClassController, 
  adminAddSessionController,
  addSessionController,
  passwordUpdateController,
  adminUpdatePasswordController,
  adminViewAnnouncementController,

} = require("../controller/adminController");

// route for the adminlogin setup

const authenticateJwt = (req, res, next) => {
  try {
    const token = req.cookies.admin_jwt;
    if (!token) {
      console.log("Token not found");
      res.render("adminLogin.ejs", {
        message: message.AUTHENTICATE_ERROR,
        status: status.ERROR,
      });
    } else {
      jwt.verify(token, process.env.ADMIN_SECRET_KEY, (error, payload) => {
        if (error) {
          console.log("Error while verifying token:", error);
          res.render("adminLogin.ejs", {
            message: message.JWT_VERIFYING_ERROR,
            status: status.ERROR,
          });
        } else {
          req.adminPayload = payload;
          next();
        }
      });
    }
  } catch {
    (error) => {
      console.log("Error form autheticate admin:", error);
      res.render(
        "adminLogin.ejs",
        (message = message.SOMETHING_WENT_WRONG),
        (status = status.ERROR)
      );
    };
  }
};

const authorizeJwt = (req, res, next) => {
  try {
    if (req.adminPayload.role === "admin") {
      next();
    } else {
      console.log("Error inside authorize jwt");
      res.render("adminLogin.ejs", {
        message: message.AUTHORIZE_ERROR,
        status: status.ERROR,
      });
    }
  } catch {
    (error) => {
      console.log("Error inside authorize:", error);
      res.render("adminLogin.ejs", {
        message: message.AUTHORIZE_ERROR,
        status: status.ERROR,
      });
    };
  }
};

router.post("/adminLogin", adminLogInController);
router.get("/adminHome", authenticateJwt, authorizeJwt, adminHomeController);
router.get("/adminLogOut", authenticateJwt, adminLogOutController);
router.post("/teacherRegistrationLink", authenticateJwt, teacherRegistrationLinkController);
router.get("/adminViewTeacherList", authenticateJwt, adminViewTeacherListController);
router.post("/adminVerifyTeacher", authenticateJwt, adminVerifyTeacherController);
router.get("/adminViewStudentList", authenticateJwt, adminViewStudentListController);
router.post("/adminVerifyStudent", authenticateJwt, adminVerifyStudentController);
router.get("/adminAddClass", authenticateJwt, adminAddClassController);
router.post("/addClass", authenticateJwt, addClassController);
router.get("/adminAssignClass", authenticateJwt, adminAssignClassController);
router.post("/assignClass", authenticateJwt, assignClassController);
router.get("/adminAddSession", authenticateJwt, adminAddSessionController);
router.post("/addSession", authenticateJwt, addSessionController);
router.get("/passwordUpdate", authenticateJwt, passwordUpdateController);
router.post("/adminUpdatePassword", authenticateJwt, adminUpdatePasswordController);
router.get("/adminViewAnnouncement", authenticateJwt, adminViewAnnouncementController);

module.exports = router;
