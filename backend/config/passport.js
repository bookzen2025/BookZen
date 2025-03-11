import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Hàm tạo JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

// Hàm tạo refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
};

// Cấu hình Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/user/auth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
        let user = await userModel.findOne({ googleId: profile.id });

        if (user) {
          // Người dùng đã tồn tại, cập nhật thông tin nếu cần
          user = await userModel.findOneAndUpdate(
            { googleId: profile.id },
            {
              name: profile.displayName,
              profilePicture: profile.photos[0]?.value || '',
            },
            { new: true }
          );
        } else {
          // Kiểm tra xem email đã tồn tại chưa
          const existingUserWithEmail = await userModel.findOne({ email: profile.emails[0].value });

          if (existingUserWithEmail) {
            // Liên kết tài khoản Google với tài khoản hiện có
            existingUserWithEmail.googleId = profile.id;
            existingUserWithEmail.isGoogleUser = true;
            existingUserWithEmail.profilePicture = profile.photos[0]?.value || existingUserWithEmail.profilePicture;
            await existingUserWithEmail.save();
            user = existingUserWithEmail;
          } else {
            // Tạo người dùng mới
            user = await userModel.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              profilePicture: profile.photos[0]?.value || '',
              isGoogleUser: true
            });
          }
        }

        // Tạo token và refresh token
        const token = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        // Cập nhật refresh token trong cơ sở dữ liệu
        user.refreshToken = newRefreshToken;
        user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
        await user.save();

        // Trả về thông tin người dùng và token
        return done(null, {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            isGoogleUser: user.isGoogleUser
          },
          token,
          refreshToken: newRefreshToken
        });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport; 