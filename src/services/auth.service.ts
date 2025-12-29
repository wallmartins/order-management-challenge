import { User } from "../models";
import { hashPassword, comparePassword, generateToken } from "../utils";
import { IAuthResponse, IUserDocument, IUserResponse } from "../types";
import { RegisterInput, LoginInput } from "../validators";

const mapUserToResponse = (user: IUserDocument): IUserResponse => {
  return {
    id: user._id.toString(),
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const register = async (data: RegisterInput): Promise<IAuthResponse> => {
  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    email: data.email,
    password: hashedPassword,
  });

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: mapUserToResponse(user),
    token,
  };
};

export const login = async (data: LoginInput): Promise<IAuthResponse> => {
  const user = await User.findOne({ email: data.email });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: mapUserToResponse(user),
    token,
  };
};
