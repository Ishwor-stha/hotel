module.exports.forgetPasswordMessage = (link, name) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Recovery</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            width: 100%;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
          }
          .button {
            background-color: #4CAF50;
            color: white;
            padding: 12px 20px;
            text-align: center;
            display: inline-block;
            font-size: 16px;
            border-radius: 5px;
            text-decoration: none;
          }
          .footer {
            font-size: 12px;
            color: #777;
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Password Recovery Request</h1>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. If you made this request, click the link below to reset your password:</p>
          <a href="${link}" class="button">Reset Password</a>
          <p>If you did not request a password reset, please ignore this email.</p>
          <div class="footer">
            <p>Thank you for using our service.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
