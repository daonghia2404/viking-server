const nodemailer =  require('nodemailer');
const dotenv = require('dotenv')
dotenv.config()

const createTransporter = () => {
  const transporter =  nodemailer.createTransport({ // config mail server
    service: 'Gmail',
    auth: {
        user: process.env.ACCOUNT_TRANSPORTER,
        pass: process.env.PASSWORD_TRANSPORTER
    }
  });
  return transporter
}

const configMailOption = (to, subject, text, html) => {
  const mainOptions = {
    from: process.env.ACCOUNT_TRANSPORTER,
    to,
    subject,
    text,
    html
  }

  return mainOptions
}

module.exports = { createTransporter, configMailOption }