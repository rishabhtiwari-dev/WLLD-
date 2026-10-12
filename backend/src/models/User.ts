import mongoose, { Document, Schema } from 'mongoose';
import { IUser, UserRole } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      enum: ['brand', 'creator'],
      required: [true, 'Role is required (brand or creator)']
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as any).passwordHash;
        return ret;
      }
    }
  }
);

export const User = mongoose.model<IUserDocument>('User', userSchema);
