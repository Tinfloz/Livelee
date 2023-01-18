import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/user.reducer/user.slice";
import padReducer from "./reducers/pads.reducer/pads.slice"

export const store = configureStore({
    reducer: {
        user: userReducer,
        pads: padReducer
    }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
