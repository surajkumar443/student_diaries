const express=require("express");
const app=express();
const path=require("path");
const dotenv=require("dotenv");
dotenv.config();
const bodyParser=require("body-parser");
const cookieParser=require("cookie-parser");
const expressFileUpload=require("express-fileupload");

const adminRouter=require("./router/adminRouter");
const teacherRouter=require("./router/teacherRouter");
const studentRouter=require("./router/studentRouter");
const guestRouter=require("./router/guestRouter");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(expressFileUpload());

// set up of mongoose

const mongoose=require("mongoose");

mongoose.connect(process.env.URL)
.then(() => console.log("mongoose connected successfully"));

// set up of the route to listen the route

const port=process.env.PORT || 3000;

app.listen(port, (req, res)=>{

    console.log(`server is listening on ${port}`);
});

// this route is for the main landingpage

app.get("/", (req, res)=>{

    res.render("index.ejs");
});

//routes for the admin login page

const { message, status } = require("./utils/statusMessage");
const {adminCheckCredentials} = require("./utils/adminUtil");

app.get("/adminLogin", async (req, res) => {

  let response = await adminCheckCredentials();
  if (!response) {
    res.render("adminLogin.ejs", {
      message: message.ADMIN_CREDENTIALS_NOT_AVAILABLE,
      status: status.ERROR,
    });
  }
  else{
    res.render("adminLogin.ejs", { message: "", status: "" });
  }
 
});

//route for maintaining a guest route

app.use("/guest", guestRouter);

// route for maintaining the admin route

app.use("/admin", adminRouter);

// route for maintaining the teacher route

app.use("/teacher", teacherRouter);

// route for maintaining the student route

app.use("/student", studentRouter);


app.get("/single", (req, res)=>{

  res.render("single.ejs");
});

app.get("/viewprofile", (req, res)=>{

  res.render("viewProfile.ejs");
});