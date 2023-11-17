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
    from: "adm72024@gmail.com",
    to: options.to,
    subject: options.subject,
    html: options.text,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log("send mail error", err); //Kmit@12345678901
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;
