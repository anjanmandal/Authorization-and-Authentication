const mailer=require('nodemailer');
const sendEmail=async (option)=>{
    const transporter=mailer.createTransport({
        services:process.env.EMAIL_HOST,//it can be any server like gmail etc.........
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USER,
            password:process.env.EMAIL_PASSWORD
        }
    })
    const emailOptions={
        from:'System <systemsupport@warhawks.com>',
        to:option.email,
        subject:option.subject,
        text:option.message
    }
   await transporter.sendMail(emailOptions);
}
