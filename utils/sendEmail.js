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
    from: "abhinavdsb1@gmail.com",
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