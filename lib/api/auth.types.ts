export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type RegisterResponse = {
  data: {
    user: User;
  };
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  data: {
    accessToken: string;
    tokenType: 'Bearer';
    user: User;
  };
};

export type CurrentUserResponse = {
  data: {
    user: User;
  };
};

export type LogoutResponse = {
  data: {
    message: string;
    tokenInvalidation: 'client-managed';
  };
};
