module.exports.messageTemplate = (code, name) => {
    return `
    <div style="
        font-family: Arial, sans-serif;
        max-width: 400px;
        margin: 20px auto;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        text-align: center;
        background: linear-gradient(135deg, #6a11cb, #2575fc);
        color: white;">
        
        <h2 style="margin-bottom: 10px;">🔒 Verification Code</h2>
        <p>Hello, <strong>${name}</strong>! 🎉</p>
        <p>You have requested a verification code. Please use the code below:</p>
        
        <div style="
            display: inline-block;
            background: white;
            color: #2575fc;
            font-size: 24px;
            font-weight: bold;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 10px 0;">
            ${code}
        </div>

        <p>If you did not request this code, please ignore this email.</p>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid rgba(255, 255, 255, 0.5);">
        
        <p style="font-size: 12px; opacity: 0.8;">
            📩 This email was sent from <strong>${process.env.HotelName}</strong>.  
            If you received this email by mistake, please disregard it.  
            Do not share your verification code with anyone for security reasons.
        </p>
    </div>
    `;
};
