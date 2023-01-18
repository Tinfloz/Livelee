import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ValidationErrors } from "../../interfaces/errors/validation.errors";
import { ISetJamPad } from "../../interfaces/owner.interface";
import { IAddressSet, IUserCreds, IUserInit, IUserResponse } from "../../interfaces/user.interface";
import { RootState } from "../../store";
import userService from "./user.service";

const user = JSON.parse(localStorage.getItem("user")!);

const initialState: IUserInit = {
    user: user ? user : null,
    isSuccess: false,
    isError: false,
    isLoading: false,
    message: ""
};

// login 
export const loginUser = createAsyncThunk<
    IUserResponse,
    IUserCreds,
    {
        rejectValue: ValidationErrors
    }
>("login/user", async (userCreds, thunkAPI) => {
    try {
        return await userService.loginUser(userCreds);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)
            || error.message || error.toString();
        return thunkAPI.rejectWithValue(message)
    };
});

// register
export const registerUser = createAsyncThunk<
    IUserResponse,
    IUserCreds,
    {
        rejectValue: ValidationErrors
    }
>("register/user", async (userCreds, thunkAPI) => {
    try {
        return await userService.registerUser(userCreds);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)
            || error.message || error.toString();
        return thunkAPI.rejectWithValue(message)
    };
});

// set address
export const setAddressLoginUser = createAsyncThunk<
    IAddressSet,
    IAddressSet,
    {
        state: RootState,
        rejectValue: ValidationErrors
    }
>("set/address", async (address, thunkAPI) => {
    try {
        const token = thunkAPI.getState().user.user!.token;
        return await userService.setAddressUser(token, address)
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)
            || error.message || error.toString();
        return thunkAPI.rejectWithValue(message)
    };
});

// create jam pad
export const createJamPadLoginOwner = createAsyncThunk<
    {
        success: boolean,
        id: string
    },
    ISetJamPad,
    {
        state: RootState,
        rejectValue: ValidationErrors
    }
>("create/pad", async (padDetails, thunkAPI) => {
    try {
        const token = thunkAPI.getState().user.user!.token;
        return await userService.setJamPads(padDetails, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)
            || error.message || error.toString();
        return thunkAPI.rejectWithValue(message)
    };
});

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        resetUser: state => initialState,
        resetUserHelpers: state => ({
            ...initialState,
            user: state.user
        })
    },
    extraReducers: builder => {
        builder
            .addCase(loginUser.pending, state => {
                state.isLoading = true;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<IUserResponse>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload.sendUser;
            })
            .addCase(loginUser.rejected, (state, { payload }) => {
                state.isError = true;
                state.isLoading = false;
                state.message = payload!
            })
            .addCase(registerUser.pending, state => {
                state.isLoading = true;
            })
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<IUserResponse>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload.sendUser;
            })
            .addCase(registerUser.rejected, (state, { payload }) => {
                state.isError = true;
                state.isLoading = false;
                state.message = payload!
            })
            .addCase(setAddressLoginUser.pending, state => {
                state.isLoading = true;
            })
            .addCase(setAddressLoginUser.fulfilled, (state, action: PayloadAction<IAddressSet>) => {
                state.isLoading = false;
                state.isSuccess = true;
                const newLoginUser = {
                    ...state.user!.loginUser,
                    address: action.payload.address,
                    city: action.payload.city,
                    state: action.payload.state,
                    pincode: action.payload.pincode
                };
                const newUser = {
                    ...state.user!,
                    loginUser: newLoginUser
                };
                state.user = newUser;
            })
            .addCase(setAddressLoginUser.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload!
            })
            .addCase(createJamPadLoginOwner.pending, state => {
                state.isLoading = true;
            })
            .addCase(createJamPadLoginOwner.fulfilled, (state, action: PayloadAction<{ success: boolean, id: string }>) => {
                state.isSuccess = true;
                state.isLoading = false;
                const newPad = [...state.user!.loginUser.pad, action.payload.id];
                const newLoginUser = {
                    ...state.user!.loginUser,
                    pad: newPad
                };
                const newUser = {
                    ...state.user!,
                    loginUser: newLoginUser
                };
                state.user = newUser;
            })
            .addCase(createJamPadLoginOwner.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload!
            })
    }
});

export const { resetUser, resetUserHelpers } = userSlice.actions;
export default userSlice.reducer;