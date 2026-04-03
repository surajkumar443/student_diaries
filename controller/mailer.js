const nodemailer=require("nodemailer");

const mailer=function(email,status,callback){

    const transport=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.USER_EMAIL,
            pass:process.env.EMAIL_PASSWORD,
        }
    });

    const endPoint=status?"student/studentRegistration": "teacher/teacherRegistration";

    const mailOption={

        from:process.env.USER_EMAIL,
        to:email,
        subject:`Registration Link for ${status?'Student':'Teacher'}`,
        html:`Hello ${email}, This is simply a registration link which is given below, you must need to click on the 
        below link to register yourself.
        <br><br>
        <form action='http://localhost:3000/${endPoint}' method='post'>
           <input type='hidden' name='email' id='email' value='${email}'>
           <button>Click To Register</button>
        </form>
        `
    }

    transport.sendMail(mailOption, (error, info)=>{

        if(error){

            console.log("Error while sending mail from mailer :", error);
            callback(false);
        }
        else{
            console.log("Mail send from mailer");
            callback(info);
        }
    });
}

module.exports={mailer:mailer};