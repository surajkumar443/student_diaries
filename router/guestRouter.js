const express = require("express");
const router = express.Router();

const {
  contactController,
  galleryController,
  aboutController,
  classesController,
} = require("../controller/guestController");

router.get("/contact", contactController);
router.get("/gallery", galleryController);
router.get("/about", aboutController);
router.get("/classes", classesController);

module.exports = router;
