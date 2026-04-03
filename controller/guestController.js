const express = require("express");

module.exports.contactController = (req, res) => {
  try {

    res.render("contact.ejs");

  } catch (error) {

    console.log("Error in contact Controller:", error);
    res.render("index.ejs");
  }
};

module.exports.galleryController = (req, res) => {
  try {

    res.render("gallery.ejs");

  } catch (error) {
    
    console.log("Error in gallery Controller:", error);
    res.render("index.ejs");
  }
};

module.exports.aboutController = (req, res) => {
  try {

    res.render("about.ejs");

  } catch (error) {
    
    console.log("Error in gallery Controller:", error);
    res.render("index.ejs");
  }
};

module.exports.classesController = (req, res) => {
  try {

    res.render("classes.ejs");

  } catch (error) {
    
    console.log("Error in gallery Controller:", error);
    res.render("index.ejs");
  }
};