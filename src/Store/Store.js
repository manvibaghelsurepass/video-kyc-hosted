import { combineSlices } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'
import appSlice from "/src/slices/AppSlice.js";
import SocketHandle from "/src/slices/Socket.js"
export const rootReducer = combineSlices({
    appSlice,
    SocketHandle
})

export const store = configureStore({
    reducer: rootReducer,
})
