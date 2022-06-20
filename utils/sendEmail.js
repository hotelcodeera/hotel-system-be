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
    from: "abhinav.4952@gmail.com",
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