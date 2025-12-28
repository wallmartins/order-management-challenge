import { Document } from 'mongoose';

export interface IUser {
  email: string;
  password: string;
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthResponse {
  user: IUserResponse;
  token: string;
}
