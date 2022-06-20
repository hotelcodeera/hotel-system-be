const nodemailer = require("nodemailer");

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: "apiKey",
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
      console.log(err);//Kmit@12345678901
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;