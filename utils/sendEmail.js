const nodemailer = require("nodemailer");

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: "apikey",
      pass: "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",
    },
  });

  const mailOptions = {
    from: "sgsheadofdepartment@gmail.com",
    to: options.to,
    subject: options.subject,
    html: options.text,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log("send mail error", err);//Kmit@12345678901
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;