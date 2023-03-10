import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ValidationErrors } from "../../interfaces/errors/validation.errors";
import { IPadInit, IPadNearbyResponse, IPads } from "../../interfaces/pad.interface";
import { RootState } from "../../store";
import padService from "./pads.service";

const initialState: IPadInit = {
    pads: null,
    slots: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: ""
}

// get pads nearby
export const getNearbyPadsLoginUser = createAsyncThunk<
    IPadNearbyResponse,
    {
        latitude: number,
        longitude: number
    },
    {
        state: RootState,
        rejectValue: ValidationErrors
    }
>("nearby/pads", async (details, thunkAPI) => {
    try {
        const { latitude, longitude } = details;
        const token = thunkAPI.getState().user.user!.token;
        return await padService.getNearbyPadsUser(latitude, longitude, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)
            || error.message || error.toString();
        return thunkAPI.rejectWithValue(message)
    };
});

// get pads by id
export const getPadsByIdLoginUser = createAsyncThunk<
    {
        success: boolean,
        pad: IPads
    },
    string,
    {
        state: RootState,
        rejectValue: ValidationErrors
    }
>("pad/id", async (id, thunkAPI) => {
    try {
        const token = thunkAPI.getState().user.user!.token;
        return await padService.getPadByIdUser(id, token);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)
            || error.message || error.toString();
        return thunkAPI.rejectWithValue(message)
    };
});

// get slots for user
export const getSlotsByDateUser = createAsyncThunk<
    {
        success: boolean,
        slots: Array<string>
    },
    {
        id: string,
        date: {
            date: string
        }
    },
    {
        state: RootState,
        rejectValue: ValidationErrors
    }
>("slots/date", async (details, thunkAPI) => {
    try {
        const { id, date } = details;
        const token = thunkAPI.getState().user.user!.token;
        return await padService.getSlotsByDate(id, token, date,);
    } catch (error: any) {
        const message = (error.response && error.response.data && error.response.data.message)
            || error.message || error.toString();
        return thunkAPI.rejectWithValue(message)
    };
});

const padSlice = createSlice({
    name: "pad",
    initialState,
    reducers: {
        resetPad: state => initialState,
        resetPadHelpers: state => ({
            ...initialState,
            pads: state.pads,
            slots: state.slots
        })
    },
    extraReducers: builder => {
        builder
            .addCase(getNearbyPadsLoginUser.pending, state => {
                state.isLoading = true;
            })
            .addCase(getNearbyPadsLoginUser.fulfilled, (state, action: PayloadAction<IPadNearbyResponse>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.pads = action.payload.padsArray;
            })
            .addCase(getNearbyPadsLoginUser.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload!
            })
            .addCase(getPadsByIdLoginUser.pending, state => {
                state.isLoading = true;
            })
            .addCase(getPadsByIdLoginUser.fulfilled, (state, action: PayloadAction<{ success: boolean, pad: IPads }>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.pads = action.payload.pad;
            })
            .addCase(getPadsByIdLoginUser.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload!
            })
            .addCase(getSlotsByDateUser.pending, state => {
                state.isLoading = true;
            })
            .addCase(getSlotsByDateUser.fulfilled, (state, action: PayloadAction<{ success: boolean, slots: Array<string> }>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.slots = action.payload.slots;
            })
            .addCase(getSlotsByDateUser.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload!
            })
    },
});

export const { resetPad, resetPadHelpers } = padSlice.actions;
export default padSlice.reducer;