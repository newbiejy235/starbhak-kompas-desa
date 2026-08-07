export type ActionState = {
  success: boolean;
  message: string;
};

export type RegisterInput = {
  username: string;
  fullName: string;
  noTelp: string;
  password: string;
  email: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export const initialState: ActionState = {
  success: false,
  message: "",
};
