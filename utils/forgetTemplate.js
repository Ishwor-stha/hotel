module.exports.forgetPasswordMessage = (link, name) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Recovery</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: Arial, sans-serif;
          }
          /* Wrapper Table for Background */
          .email-wrapper {
            width: 100%;
            background: linear-gradient(to right, #6a11cb, #2575fc);
            padding: 20px 0;
          }
          .container {
            background-color: white;
            border-radius: 10px;
            padding: 25px;
            width: 100%;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            text-align: center;
          }
          h1 {
            color: #6a11cb;
          }
          p {
            font-size: 16px;
            color: #555;
          }
          .button {
            background: linear-gradient(to right, #ff512f, #dd2476);
            color: white;
            padding: 14px 25px;
            text-align: center;
            display: inline-block;
            font-size: 18px;
            font-weight: bold;
            border-radius: 8px;
            text-decoration: none;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            transition: 0.3s ease-in-out;
          }
          .button:hover {
            background: linear-gradient(to right, #dd2476, #ff512f);
            transform: scale(1.05);
          }
          .fallback-text {
            font-size: 14px;
            color: #777;
            margin-top: 20px;
          }
          .link-box {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
            word-wrap: break-word;
            font-size: 14px;
            color: #333;
            display: inline-block;
            max-width: 90%;
          }
          .footer {
            font-size: 13px;
            color: #777;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <!-- Table Wrapper to Keep Background Consistent -->
        <table class="email-wrapper" cellspacing="0" cellpadding="0" width="100%">
          <tr>
            <td align="center">
              <div class="container">
                <h1>Password Recovery</h1>
                <p>Hello <strong>${name}</strong>,</p>
                <p>We received a request to reset your password. If you made this request, click the button below:</p>
                <a href="${link}" class="button">Reset Password</a>

                <!-- Copy-Paste Alternative -->
                <p class="fallback-text">If the button above does not work, please copy and paste the link below into your browser:</p>
                <div class="link-box">${link}</div>

                <p>If you did not request this, you can safely ignore this email.</p>
                <div class="footer">
                  <p>Need help? Contact our support team.</p>
                  <p>Thank you for using our service!</p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};
