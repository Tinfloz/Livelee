import axios from "axios";
import { ISetJamPad } from "../../interfaces/owner.interface";
import { IAddressSet, IUserCreds, IUserResponse } from "../../interfaces/user.interface";

const API_URL = "http://localhost:5000/api/user";
const API_OWNER = "http://localhost:5000/api/owner"

// login
const loginUser = async (userCreds: IUserCreds): Promise<IUserResponse> => {
    const response = await axios.post(API_URL + "/login", userCreds);
    if (response) {
        localStorage.setItem("user", JSON.stringify(response.data.sendUser));
    };
    return response.data;
};

// register
const registerUser = async (userCreds: IUserCreds): Promise<IUserResponse> => {
    const response = await axios.post(API_URL + "/register", userCreds);
    if (response) {
        localStorage.setItem("user", JSON.stringify(response.data.sendUser));
    };
    return response.data;
};

// set address
const setAddressUser = async (token: string, address: IAddressSet): Promise<IAddressSet> => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.post(API_URL + "/set/address", address, config);
    const user = JSON.parse(localStorage.getItem("user")!);
    const newLoginUser = {
        ...user.loginUser,
        "address": response.data.address,
        "city": response.data.city,
        "state": response.data.state,
        "pincode": response.data.pincode
    };
    const newUser = { ...user, "loginUser": newLoginUser };
    localStorage.setItem("user", JSON.stringify(newUser));
    return response.data;
};

// set jam pad
const setJamPads = async (padDetails: ISetJamPad, token: string): Promise<{ success: boolean, id: string }> => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.post(API_OWNER + "/create/pad", padDetails, config);
    console.log(response, "in service")
    const user = JSON.parse(localStorage.getItem("user")!);
    const newPad = [...user.loginUser.pad, response.data.id]
    const newLoginUser = {
        ...user.loginUser,
        "pad": newPad
    };
    const newUser = {
        ...user,
        "loginUser": newLoginUser
    };
    localStorage.setItem("user", JSON.stringify(newUser));
    return response.data;
}

const userService = {
    registerUser,
    loginUser,
    setAddressUser,
    setJamPads
};

export default userService;
