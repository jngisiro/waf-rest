const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name;
    this.url = url;
    this.from = `Support at Safe Water Uganda <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // Create transporter
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASS,
        },
      });
    }

    return nodemailer.createTransport({
      service: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send the real email
  async send(template, subject) {
    // Render HTML for the email
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      name: this.firstName,
      subject: 'Safe Water Uganda',
      message: this.message,
      email: this.from,
      url: this.url,
    });

    // Define email options
    const mailOptions = {
      // from: this.from,
      from: 'support@safewater.co.ug',
      to: this.to,
      subject,
      html,
      // text: htmlToText(html, { wordwrap: 130 }),
      //html:
    };

    // Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Safe Water 😁');
  }

  async sendMessage() {
    await this.send('message', '🧐 Message from Safe Water Contact Form');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (Valid for only 10 minutes)'
    );
  }
};
