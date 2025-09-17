import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    tokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

userSchema.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model('User', userSchema);
