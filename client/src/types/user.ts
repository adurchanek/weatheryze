export interface UserInfo {
  _id: string;
  name: string;
  email: string;
}

export interface UserState {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  token: string | null;
  loading: boolean;
}
