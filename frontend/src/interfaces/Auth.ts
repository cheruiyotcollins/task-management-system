export interface ICredentials {
  email: string;
  password: string;
}
export interface IUserDetails {
  password: string;
  fullName: string;
  email: string;
  gender: string;
  contact: string;
}
export interface IPaginatedUsersResponse {
  email: string;
  roles: string[];
  fullName: string;
  contact: string;
  gender: string;
  userId: string;
  profileImagePath: string;
  firstLogin: boolean;
}
export interface IUser {
  userId: string;
  email: string;
  username?: string;
  roles: string[];
  fullName: string;
  contact: string;
  gender: string;
  profileImagePath?: string;
  firstLogin?: boolean;
}
