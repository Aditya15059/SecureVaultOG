import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'operator'
  },
  // Auth Error Handling fields
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  // Forgot Password fields
  resetOtp: {
    type: String // Hashed OTP
  },
  resetOtpExpires: {
    type: Date
  },
  resetToken: {
    type: String // Hashed reset token for Step 3
  },
  resetTokenExpires: {
    type: Date
  },
  resetAttempts: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
