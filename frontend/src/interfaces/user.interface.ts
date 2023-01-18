import { ValidationErrors } from "./errors/validation.errors"

export interface ISendUser {
    email: string,
    token: string,
    userType: string,
    [x: string]: any
};

export interface IUserResponse {
    sendUser: ISendUser
};

export interface IUserCreds {
    email: string,
    password: string,
    phone: string,
    userType: string
};

export interface IUserInit {
    user: ISendUser | null,
    isSuccess: boolean,
    isLoading: boolean,
    isError: boolean,
    message: string | ValidationErrors
};

export interface IAddressSet {
    address: string,
    city: string,
    state: string,
    pincode: string
};

