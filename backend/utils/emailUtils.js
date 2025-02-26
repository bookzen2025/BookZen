import nodemailer from 'nodemailer';

// Create a transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send a password reset email
export const sendPasswordResetEmail = async (email, token, baseUrl) => {
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Khôi phục mật khẩu - BookZen Books',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #452372;">BookZen Books</h2>
                </div>
                <h3>Khôi phục mật khẩu</h3>
                <p>Bạn vừa yêu cầu khôi phục mật khẩu cho tài khoản BookZen Books của mình.</p>
                <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu. Liên kết sẽ hết hạn sau 1 giờ.</p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #452372; color: white; text-decoration: none; border-radius: 4px;">Đặt lại mật khẩu</a>
                </div>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e6e6e6; font-size: 12px; color: #666;">
                    <p>© 2025 BookZen Books. All rights reserved.</p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};